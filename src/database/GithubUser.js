"use strict";
exports.__esModule = true;
var octonode = require('octonode');
exports["default"] = function (token) {
    return new Promise(function (resolve, reject) {
        var client = octonode.client(token);
        client.get('/user', {}, function (err, status, user) {
            if (!err) {
                resolve(user);
            }
            else {
                reject({
                    title: 'Could not authenticate you',
                    message: status ? "GitHub returned response code " + status : "GitHub rejected token!"
                });
            }
        });
    });
};
