const CircularJSON = require('circular-json')

import ANY from './ANY'
import SHELL from './SHELL'
import FUNCTION from './FUNCTION'
import TYPES from './TYPES'

import * as _ from 'lodash'
import * as request from 'request'
import * as value from 'es5-ext/object/valid-value'

export default function(data, context) {
  value(data) && value(data.literals) && value(data.substitutions)
  return [data.literals].concat(
    _.map(data.substitutions, (expr: string) => {
      let raw = expr.split(',')
      let type = JSON.parse(raw[0])
      let snippet = raw.slice(1).join(',')

      if (snippet === null) return null
      if (snippet === undefined) return undefined

      let result = (() => {switch (type) {
        case '_': {
          return ANY(snippet)
        }
        case 'SHELL': {
          return SHELL(eval(snippet))
        }
        case 'FUNCTION': {
          return FUNCTION(snippet)
        }
        case 'ARRAY': {
          return TYPES('array', snippet)
        }
        case 'OBJECT': {
          return TYPES('object', snippet)
        }
        case 'BOOLEAN': {
          return TYPES('boolean', snippet)
        }
        case 'STRING': {
          return TYPES('string', snippet)
        }
        case 'NUMBER': {
          return TYPES('number', snippet)
        }
      }})()

      if (result instanceof Object || typeof result === 'string') {
        return CircularJSON.stringify(result)
      } else {
        return result
      }
    })
  )
}
