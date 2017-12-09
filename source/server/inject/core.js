/**
 * Injectify core API
 * @class
 */
window.injectify = class injectify {
	/**
	 * Listen for a topic from websocket connection
	 * @param {string} topic Topic name to listen to
	 * @param {function} callback Callback to be triggered once topic received
	 */
	static listen(topic, callback) {
		ws.onmessage = d => {
			try {
				d = JSON.parse(d.data)
				if (topic == d.t || topic == '*') {
					callback(d.d, d.t)
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
	static send(topic, data) {
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
	static log(message, local) {
		this.send('r', message)
		if (local) console.log(message)
	}
	/**
	 * Get the websocket ping time (in milliseconds)
	 * @param {function} callback Callback to be executed on ping complete
	 */
	static ping(callback) {
		this.send('ping', + new Date())
		this.listen('pong', callback)
	}
	/**
	 * Safely execute a script with hidden context. Appears as 'VMXXX:1' in DevTools
	 * @param {string} func the contents inside the <script> tag
	 * @param {element} targetParent element to execute the script under, defaults to document.head
	 */
	static exec(func, targetParent) {
		if (!targetParent) var targetParent = document.head
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
	static module(name, params, callback) {
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
		console.log(true)
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
		if (topic.startsWith('module:')) {
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