"use strict";
exports.__esModule = true;
var fs = require('fs');
var yaml = require('node-yaml');
var chalk = require('chalk');
var UglifyJS = require('uglify-es');
var default_1 = /** @class */ (function () {
    function default_1() {
        this.state = {
            modules: {},
            debugModules: {},
            count: 0
        };
    }
    Object.defineProperty(default_1.prototype, "load", {
        get: function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fs.readdir(__dirname + "/modules/", function (err, folders) {
                    if (!err) {
                        folders.forEach(function (folder, index, array) {
                            var yml = {};
                            var js;
                            var error = false;
                            try {
                                js = fs.readFileSync(__dirname + "/modules/" + folder + '/module.js', 'utf8');
                                yml = yaml.parse(fs.readFileSync(__dirname + "/modules/" + folder + '/module.yml', 'utf8'));
                            }
                            catch (error) {
                                if (js && !yml.name) {
                                    // Attempt to load module in basic mode
                                    console.warn(chalk.yellowBright('[inject:module] ') +
                                        chalk.yellowBright('missing configuration for ') +
                                        chalk.magentaBright('./' + folder + '/') +
                                        chalk.yellowBright(', it may misbehave'));
                                    yml.name = folder;
                                }
                                else {
                                    error = true;
                                    console.error(chalk.redBright('[inject:module] ') +
                                        chalk.yellowBright('failed to load module ') +
                                        chalk.magentaBright('./' + folder + '/'));
                                }
                            }
                            if (!error) {
                                var unminified = js;
                                var minified = UglifyJS.minify(js).code;
                                if (minified && yml.minify !== false)
                                    js = minified;
                                if (typeof yml.name === 'object') {
                                    for (var i in yml.name) {
                                        _this.state.modules[yml.name[i]] = js;
                                        _this.state.debugModules[yml.name[i]] = unminified;
                                    }
                                }
                                else {
                                    _this.state.modules[yml.name] = js;
                                    _this.state.debugModules[yml.name] = unminified;
                                }
                                _this.state.count++;
                            }
                            if (folders.length - 1 === index)
                                resolve(_this.state);
                        });
                    }
                    else {
                        reject({
                            title: 'Failed to load modules!',
                            error: err
                        });
                    }
                });
            });
        },
        enumerable: true,
        configurable: true
    });
    return default_1;
}());
exports["default"] = default_1;
