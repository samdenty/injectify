export default function(literals /*, …substitutions*/) {
	var args = arguments
	return Array.prototype.reduce.call(literals, function(a, b, i) {
		return a + (args[i] === undefined ? "" : String(args[i])) + b
	})
}
