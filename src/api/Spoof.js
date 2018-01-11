"use strict";
exports.__esModule = true;
var default_1 = /** @class */ (function () {
    function default_1(db) {
        this.db = db;
    }
    default_1.prototype.query = function (doc, index) {
        return new Promise(function (resolve, reject) {
            var record = doc.passwords[index];
            if (record) {
                if (record.storage) {
                    var local = record.storage.local;
                    var session = record.storage.session;
                    var cookies = record.storage.cookies;
                    var js = '';
                    var property = void 0;
                    if (local) {
                        for (property in local) {
                            if (local.hasOwnProperty(property)) {
                                js +=
                                    "localStorage.setItem('" + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "', '" + local[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "');\n";
                            }
                        }
                    }
                    if (session) {
                        for (property in session) {
                            if (session.hasOwnProperty(property)) {
                                js +=
                                    "sessionStorage.setItem('" + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "', '" + session[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "');\n";
                            }
                        }
                    }
                    if (cookies) {
                        for (property in cookies) {
                            if (cookies.hasOwnProperty(property)) {
                                js +=
                                    "document.cookie = '" + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "=" + cookies[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "';\n";
                            }
                        }
                    }
                    // let minified = UglifyJS.minify(js).code
                    // if (minified) js = minified
                    if (js) {
                        resolve(js);
                    }
                    else {
                        reject({
                            title: 'Nothing to generate',
                            message: "The requested record didn't contain any storage"
                        });
                    }
                }
                else {
                    reject({
                        title: 'Database error',
                        message: 'An internal error occured whilst handling your request'
                    });
                }
            }
            else {
                reject({
                    title: 'Nonexistent index',
                    message: "The index " + index + " doesn't exist for this project"
                });
            }
        });
    };
    return default_1;
}());
exports["default"] = default_1;
