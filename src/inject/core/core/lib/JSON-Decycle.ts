export default class {
  constructor(object, replacer) {
    "use strict"
    // @ts-ignore
    var objects = new WeakMap() // object to path mappings

    return (function derez(value, path) {
      let old_path
      let nu

      if (replacer !== undefined) {
        value = replacer(value)
      }

      if (
        typeof value === "object" && value !== null &&
        !(value instanceof Boolean) &&
        !(value instanceof Date) &&
        !(value instanceof Number) &&
        !(value instanceof RegExp) &&
        !(value instanceof String)
      ) {

        old_path = objects.get(value)
        if (old_path !== undefined) {
          return { $ref: old_path }
        }

        objects.set(value, path)

        if (Array.isArray(value)) {
          nu = []
          value.forEach(function (element, i) {
            nu[i] = derez(element, path + "[" + i + "]")
          })
        } else {
          nu = {}
          Object.keys(value).forEach(function (name) {
            nu[name] = derez(
              value[name],
              path + "[" + JSON.stringify(name) + "]"
            )
          })
        }
        return nu
      }
      return value
    }(object, "$"))
  }
}
