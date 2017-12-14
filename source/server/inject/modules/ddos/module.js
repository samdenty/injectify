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