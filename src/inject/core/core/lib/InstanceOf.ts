/**
 * Returns a string-representation of a variables instance
 */
export default function instanceOf(object: any) {
  let type = typeof object

  if (type === 'undefined') {
    return 'undefined'
  }

  if (object) {
    type = object.constructor.name
  } else if (type === 'object') {
    type = Object.prototype.toString.call(object).slice(8, -1)
  }

  return type.toLowerCase()
}
