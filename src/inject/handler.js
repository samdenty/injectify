"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var LoadModules_1 = require("./LoadModules");
var Websockets_1 = require("./Websockets");
var fs = require('fs');
var UglifyJS = require('uglify-es');
var sockjs = require('sockjs');
var core = fs.readFileSync(__dirname + "/core/core.js", 'utf8');
var default_1 = /** @class */ (function () {
    function default_1(express, mongodb) {
        var _this = this;
        this.state = {
            core: UglifyJS.minify(core).code,
            debugCore: core,
            modules: {},
            debugModules: {},
            clients: [],
            watchers: [],
            authenticate: {}
        };
        this.db = mongodb;
        this.server = sockjs.createServer({ log: function (severity, message) {
                if (severity === 'debug') {
                    console.log(chalk_1["default"].greenBright('[SockJS] ') +
                        chalk_1["default"].yellowBright(message));
                }
                else if (severity === 'error') {
                    console.log(chalk_1["default"].redBright('[SockJS] ') +
                        chalk_1["default"].yellowBright(message));
                }
                else if (global.config.verbose) {
                    console.log(chalk_1["default"].greenBright('[SockJS] ') +
                        chalk_1["default"].yellowBright(message));
                }
            } });
        var websocket = new Websockets_1["default"](this.db);
        this.server.on('connection', function (socket) { return websocket.initiate(socket); });
        var modules = new LoadModules_1["default"]();
        modules.load.then(function (_a) {
            var modules = _a.modules, debugModules = _a.debugModules, count = _a.count;
            _this.setState({
                modules: modules,
                debugModules: debugModules
            });
            console.log(chalk_1["default"].greenBright('[inject:modules] ') +
                chalk_1["default"].yellowBright("successfully loaded " + chalk_1["default"].magentaBright(count.toString()) + " modules into memory"));
            _this.server.installHandlers(express, { prefix: '/i' });
        })["catch"](function (_a) {
            var title = _a.title, error = _a.error;
            console.error(title, error);
        });
    }
    default_1.prototype.setState = function (newState) {
        var _this = this;
        Object.keys(newState).forEach(function (state) {
            _this.state[state] = newState[state];
        });
    };
    return default_1;
}());
exports["default"] = default_1;
