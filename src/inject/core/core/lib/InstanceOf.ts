/**
 * Returns a string-representation of a variables instance
 */
export default function instanceOf(string: any) {
	try {
		if (typeof string === 'undefined') {
			return 'undefined'
		} else if (typeof string === 'number') {
			return 'number'
		} else if (string === null) {
			return 'null'
		} else if (string.constructor) {
			var type = string.constructor.toString()
			if (!type) return typeof string
			type = type.split(' ')[1]
			if (!type) return typeof string
			type = type.slice(0, -2).toLowerCase()
			return type
		} else {
			return typeof string
		}
	} catch(e) {
		return typeof string
	}
}