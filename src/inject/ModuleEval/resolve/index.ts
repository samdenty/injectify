const CircularJSON = require('circular-json')

import ANY from './ANY'
import SHELL from './SHELL'
import FUNCTION from './FUNCTION'
import TYPES from './TYPES'
import WRITE from './WRITE'

import * as _ from 'lodash'
import * as request from 'request'
import * as value from 'es5-ext/object/valid-value'
import chalk from 'chalk'

export default function(data, context) {
  value(data) && value(data.literals) && value(data.substitutions)
  return [data.literals].concat(
    _.map(data.substitutions, (expr: string) => {
      let raw = expr.split(',')
      let type = JSON.parse(raw[0])
      let snippet = raw.slice(1).join(',')

      if (snippet === null) return null
      if (snippet === undefined) return undefined

      let allowed = (<any>global).config.serverExecution
        ? (<any>global).config.serverExecution.enabledCommands.includes(type)
        : true
      if (allowed) {
        let result = (() => {
          switch (type) {
            case '_': {
              return ANY(snippet, context)
            }
            case 'SHELL': {
              return SHELL(snippet, context)
            }
            case 'FUNCTION': {
              return FUNCTION(snippet, context)
            }
            case 'ARRAY': {
              return TYPES('array', snippet, context)
            }
            case 'OBJECT': {
              return TYPES('object', snippet, context)
            }
            case 'BOOLEAN': {
              return TYPES('boolean', snippet, context)
            }
            case 'STRING': {
              return TYPES('string', snippet, context)
            }
            case 'NUMBER': {
              return TYPES('number', snippet, context)
            }
            case 'WRITE': {
              return WRITE(snippet, context)
            }
          }
        })()

        if (result instanceof Object || typeof result === 'string') {
          return CircularJSON.stringify(result)
        } else {
          return result
        }
      } else {
        if ((<any>global).config.verbose)
          console.log(
            chalk.redBright('[inject/module] ') +
            chalk.yellowBright('prevented access to the ') +
            chalk.magentaBright(type) +
            chalk.yellowBright(` server-side module function, as it's not enabled in server.config.js`)
          )

        return `(function(){throw new Error('Server-side function "$.${type}" disabled!')})()`
      }
    })
  )
}
