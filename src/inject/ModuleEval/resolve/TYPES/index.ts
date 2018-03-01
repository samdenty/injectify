import * as typeOf from 'typeof'

export default (type: string, data: any) => {
  let resolver
  let currentType
  try {
    resolver = new Function(`return (${data})`)()
    currentType = typeOf(resolver)
    if (currentType !== type && currentType === 'string') {
      resolver = new Function(`return (${resolver})`)()
      currentType = typeOf(resolver)
    }
  } catch (e) {
    throw new TypeError(
      'Module snippet compilation failed!\n\tbody: ' +
        JSON.stringify(data) +
        '\n\terror: ' +
        e.stack
    )
  }
  if (currentType !== type) {
    throw new TypeError(
      `Type assertion failed! Expected ${type} but received ${typeOf(resolver)}\n\tbody: ` +
      JSON.stringify(data)
    )
  } else {
    return resolver
  }
}
