"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Spoof_1 = require("./Spoof");
const Payload_1 = require("./Payload");
class default_1 {
    constructor(mongodb) {
        this.db = mongodb;
    }
    spoof(req, res) {
        let token = req.query.token;
        let index = parseInt(req.query.index);
        let project = decodeURIComponent(req.path.substring(11));
        /**
         * Validate the token exists, the index is a number and the project param exists
         */
        if (token && !Number.isNaN(index) && project) {
            let api = new Spoof_1.default(this.db);
            api.query(token, index).then(json => {
                console.log(json);
            }).catch(error => {
                console.log(error);
            });
        }
        else {
            res.json({
                title: 'Bad request',
                message: 'Make sure you specify a project, index and token in the request',
                format: '/api/spoof/$project?index=$index&token=$token'
            });
        }
    }
    payload(req, res) {
        new Payload_1.default(this.db).then();
    }
}
exports.default = default_1;
