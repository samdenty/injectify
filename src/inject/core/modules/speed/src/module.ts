import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings


let image = {
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
    let startTime, endTime
    /**
     * Request the target url
     */
    let download = new Image()
    download.onload = () => {
        endTime = +new Date
        showResults()
    }

    download.onerror = (err) => {
        Module.reject(err)
        return
    }

    startTime = +new Date
    download.src = image.url + "?" + startTime

    function showResults() {
        let duration: number = (endTime - startTime) / 1000
        let bitsLoaded: number = image.bytes * 8
        // @ts-ignore
        let speedBps: number = (bitsLoaded / duration).toFixed(2)
        // @ts-ignore
        let speedKbps: number = (speedBps / 1024).toFixed(2)
        // @ts-ignore
        let speedMbps: number = (speedKbps / 1024).toFixed(2)
        let results = {
            duration: duration,
            speed: {
                bps: speedBps,
                kbps: speedKbps,
                mbps: speedMbps
            },
            downlink: navigator && navigator['connection'] ? navigator['connection']['downlink'] : null
        }
        Module.resolve(results)
    }
})()