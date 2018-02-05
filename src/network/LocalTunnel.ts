declare var global: any

const localtunnel = require('localtunnel')
import chalk from 'chalk'

export default class {
  tunnel: any

  constructor() {
    try {
      this.tunnel = localtunnel(global.config.express, {
        subdomain: this.subdomain
      }, (err, tunnel) => {
        if (!err) {
          console.log(`${chalk.greenBright(`[LocalTunnel]`)} ${chalk.yellowBright(`available over the internet at`)} ${chalk.magentaBright(tunnel.url)}`)
        } else {
          console.error(`${chalk.redBright(`[LocalTunnel]`)} ${chalk.yellowBright(`[warning] failed to create localtunnel session`)}`, err)
        }
      })
      this.tunnel.on('close', () => this.handleClose())
    } catch(error) {
      console.error(`${chalk.redBright(`[LocalTunnel]`)} ${chalk.yellowBright(`failed to create a LocalTunnel.me session`)}`)
    }
  }

  handleClose() {
    console.error(`${chalk.redBright(`[LocalTunnel]`)} ${chalk.yellowBright(`session closed! attempting to re-open`)}`)
    try {
      this.tunnel = localtunnel(global.config.express, {
        subdomain: this.subdomain
      }, (err, tunnel) => {
        if (!err) {
          console.log(`${chalk.greenBright(`[LocalTunnel]`)} ${chalk.yellowBright(`re-created session, now available over the internet at`)} ${chalk.magentaBright(tunnel.url)}`)
        } else {
          console.error(`${chalk.redBright(`[LocalTunnel]`)} ${chalk.yellowBright(`failed to create a LocalTunnel.me session`)}`, err)
        }
      })
      this.tunnel.on('close', () => this.handleClose())
    } catch(error) {
      console.error(`${chalk.redBright(`[LocalTunnel]`)} ${chalk.yellowBright(`failed to create a LocalTunnel.me session`)}`)
    }
  }

  get subdomain() {
    return (global.config.localtunnel && global.config.localtunnel.subdomain) ?
      global.config.localtunnel.subdomain :
      `injectify${+new Date()}`
  }
}