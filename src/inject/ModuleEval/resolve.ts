const CircularJSON = require('circular-json')

/**
 * Default imports for snippets
 */
var request = (<any>global).request =  require("request")
var _ = (<any>global)._ =  require("lodash")
var shell = (<any>global).shell =  require('shelljs')

var value = require("es5-ext/object/valid-value"),
	normalize = require("es5-ext/object/normalize-options"),
	isVarNameValid = require("esniff/is-var-name-valid"),
	map = Array.prototype.map,
	keys = Object.keys,
	stringify = JSON.stringify

export default function (data, context) {
	value(data) && value(data.literals) && value(data.substitutions)
	return [data.literals].concat(
		map.call(data.substitutions, function(expr) {
			if (expr.startsWith('$("') && expr.endsWith('")')) {
				try {
					expr = `()=>{${JSON.parse(expr.slice(2, -1))}}`
				} catch(e) {

				}
			}
			let resolver
			if (!expr) return undefined
			try {
				resolver = new Function(`return (${expr})`)
			} catch (e) {
				throw new TypeError(
					"Unable to compile expression:\n\tbody: " +
						stringify(expr) +
						"\n\terror: " +
						e.stack
				)
			}
			try {
				let snippet = resolver()
				if (typeof snippet === 'function') snippet = snippet()

				if (snippet instanceof Object || typeof snippet === 'string') {
					return CircularJSON.stringify(snippet)
				} else {
					return snippet
				}
			} catch (e) {
				throw new TypeError(
					"Unable to resolve expression:\n\tbody: " +
						stringify(expr) +
						"\n\terror: " +
						e.stack
				)
			}
		})
	)
}
