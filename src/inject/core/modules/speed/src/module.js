/**
 * Injectify module configuration
 */
Module.config.async = true // Callback is handled by module after it has synchronously finished
/////////////////////////////////


var image = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg',
    bytes: 5245329
};

/**
 * Parse the parameters
 */
if (typeof Module.params == 'object') {
    if (Module.params.url && Module.params.bytes) image = Module.params
}

(function() {
    var startTime, endTime
    /**
     * Request the target url
     */
    var download = new Image()
    download.onload = function () {
        endTime = +new Date
        showResults()
    }

    download.onerror = function (err) {
        Module.callback({}, err)
        return
    }

    startTime = +new Date
    download.src = image.url + "?" + startTime

    function showResults() {
        var duration = (endTime - startTime) / 1000
        var bitsLoaded = image.bytes * 8
        var speedBps = (bitsLoaded / duration).toFixed(2)
        var speedKbps = (speedBps / 1024).toFixed(2)
        var speedMbps = (speedKbps / 1024).toFixed(2)
        var results = {
            duration: duration,
            speed: {
                bps: speedBps,
                kbps: speedKbps,
                mbps: speedMbps
            },
        }
        if (navigator && navigator.connection && navigator.connection.downlink)
            results.downlink = navigator.connection.downlink
        if (Module.callback)
            Module.callback(results, null)
        else
            console.log(results)
    }
})()