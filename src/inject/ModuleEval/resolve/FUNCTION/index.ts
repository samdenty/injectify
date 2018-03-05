export default (script: string, context: string) => {
  let escaped = /^'|"|`$/.test(script.charAt(0))
  try {
    try {
      // Check to make sure the script is valid first
      new Function(script)
    } catch(error) {
      /**
       * Add parentheses around the string
       *   function(){}
       * =>
       *   (function(){})()
       */
      script = `(${script})()`
    }
  } catch (e) {
  	throw new TypeError(
  		"Module snippet compilation failed!\n\tbody: " +
  			JSON.stringify(script) +
  			"\n\terror: " +
  			e.stack
  	)
  }

  try {
    let resolver = eval(`${context};${script}`)
    if (escaped) {
      try {
        new Function(`return (${resolver})`)
      } catch(error) {
        resolver = `() => {${resolver}}`
      }
      resolver = eval(`${context};${resolver}`)
    }
    if (typeof resolver === 'function') resolver = resolver()
    return resolver
  } catch (e) {
  	throw new TypeError(
  		"Unable to resolve expression:\n\tbody: " +
  			JSON.stringify(script) +
  			"\n\terror: " +
  			e.stack
  	)
  }
}