"use strict";
exports.__esModule = true;
exports["default"] = function (ip) {
    if (ip === '::1') {
        return '127.0.0.1';
    }
    else if (ip.startsWith('::ffff:')) {
        return ip.slice(7);
    }
    else {
        return ip;
    }
};
