"use strict";
exports.__esModule = true;
var default_1 = /** @class */ (function () {
    function default_1(db) {
        this.db = db;
    }
    default_1.prototype.query = function (project, user) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.db.collection('projects', function (err, projects) {
                if (err)
                    throw err;
                projects.findOne({
                    $or: [
                        {
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
                            'name': project
                        }]
                }).then(function (doc) {
                    if (doc !== null) {
                        var permissions = doc.permissions;
                        var permission = {
                            level: 0,
                            group: null
                        };
                        if (permissions.readonly.includes(user.id)) {
                            permission = {
                                level: 1,
                                group: 'readonly'
                            };
                        }
                        else if (permissions.admins.includes(user.id)) {
                            permission = {
                                level: 2,
                                group: 'admins'
                            };
                        }
                        else if (permissions.owners.includes(user.id)) {
                            permission = {
                                level: 1,
                                group: 'owners'
                            };
                        }
                        if (permission.group && permission.level) {
                            resolve({
                                permission: permission,
                                doc: doc
                            });
                        }
                        else {
                            reject({
                                title: 'Access denied',
                                message: "You don't have permission to access project " + project
                            });
                        }
                    }
                    else {
                        reject({
                            title: 'Access denied',
                            message: "Project " + project + " doesn't exist"
                        });
                    }
                });
            });
        });
    };
    return default_1;
}());
exports["default"] = default_1;
