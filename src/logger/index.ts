import * as _ from 'lodash'
import chalk from 'chalk'
import * as client from './client'
import * as express from './express'
import * as websockets from './websockets'
import Block from './Block'

/**
 * Records events and actions to the console
 * @param id Event ID
 * @param data Event data
 */
export default function(
  id: [string, string],
  type: 'log' | 'warn' | 'error',
  data?: any
) {
  const [category, action] = id
  const func = _.camelCase(action)
  /**
   * Call the appropriate handler
   */
  const message = (() => {
    try {
      const handler = require(`./${category}`)
      if (handler && handler[func]) {
        return handler[func](type, data)
      } else {
        throw new Error(
          `Failed to log info! No handlers for the log type ${JSON.stringify(
            [category, func]
          )}`
        )
      }
    } catch (error) {
      throw new Error(`Error in the Logger API\n${error.stack}`)
    }
  })()

  /**
   * Parse message
   */
  const log = message instanceof Array ? message : [message]

  /**
   * Get color
   */
  const color = type === 'log' ? 'green' : type === 'warn' ? 'yellow' : 'red'

  /**
   * Log to console
   */
  console[type](
    Block(category, chalk.bgBlackBright.whiteBright),
    Block(action, chalk[`${color}Bright`], true),
    ...log
  )
}
