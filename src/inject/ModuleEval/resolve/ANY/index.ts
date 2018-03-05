export default (script: string, context: string) => {
  let resolver
  try {
    resolver = new Function(`${context}; return (${script})`)
  } catch (e) {
  	throw new TypeError(
  		"Module snippet compilation failed!\n\tbody: " +
  			JSON.stringify(script) +
  			"\n\terror: " +
  			e.stack
  	)
  }

  try {
    let snippet = resolver()
    if (typeof snippet === 'function') {
			snippet = eval(`${context}; (${snippet.toString()})()`)
		}
    return snippet
  } catch (e) {
  	throw new TypeError(
  		"Unable to resolve expression:\n\tbody: " +
  			JSON.stringify(script) +
  			"\n\terror: " +
  			e.stack
  	)
  }
}