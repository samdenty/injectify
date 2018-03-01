export default (script: string) => {
  let resolver
  try {
    resolver = new Function(`return (${script})`)
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
    if (typeof snippet === 'function') snippet = snippet()
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