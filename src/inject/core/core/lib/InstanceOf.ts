/**
 * Returns a string-representation of a variables instance
 */
export default function instanceOf(object: any) {
  let type: string = typeof object

  if (type === 'undefined') {
    return 'undefined'
  }

  if (object) {
    type = object.constructor.name
  } else if (type === 'object') {
    type = Object.prototype.toString.call(object).slice(8, -1)
  }


  if (object instanceof Object) {
    if ('_state' in object && '_handled' in object && '_deferreds' in object) type = 'promise'
    if ('__Vow__' in object) type = 'vow'
  }

  return type.toLowerCase()
}
