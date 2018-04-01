import chalk from 'chalk'
import * as client from './client'
import * as websockets from './websockets'

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
  /**
   * Call the appropriate handler
   */
  const message = (() => {
    try {
      switch (category) {
        case 'client': {
          return client[action](type, data)
        }
        case 'websockets': {
          return websockets[action](type, data)
        }
        default: {
          throw new Error(`Failed to log info! No handlers for the log type ${JSON.stringify(id)}`)
        }
      }
    } catch(error) {
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
  const color =
    type === 'log' ? 'bgGreen' : type === 'warn' ? 'bgYellow' : 'bgRed'

  /**
   * Log to console
   */
  console[type](chalk.bold[color](`[${category}:${action}]`), ...log)
}
