declare var global: any
import chalk from 'chalk'
import { Update } from '../database/Project'
import { Injectify } from './core/definitions/core'

export default class {
  static record(socket: { session: Injectify.session.Info, client: any }, name: string, table: string, data: any) {
    let { session, client } = socket
    Update({
      name: name,
      [`data.${table}`]: {
        $exists: true
      }
    }, {
      $push: {
        [`data.${table}`]: {
          url: session.window.url,
          ip: client.ip.query,
          timestamp: +new Date(),
          data: JSON.stringify(data)
        }
      }
    }).then((result) => {
      if (result.nModified && global.config.verbose) {
        console.log(
          chalk.greenBright(`[inject/DataRecorder] `) +
          chalk.yellowBright(`Recorded data for project ${chalk.magentaBright(name)} to the ${chalk.magentaBright(table)} table`)
        )
      }
    }).catch(error => {
      if (global.config.verbose) {
        console.log(
          chalk.redBright(`[inject/DataRecorder] `) +
          chalk.yellowBright(error)
        )
      }
    })
  }
}
