import chalk from 'chalk'

/**
 * Websocket initiate process
 */
export const initiate = (type, data) =>
  type === 'warn' ? chalk.yellowBright(data) : data

/**
 * Websocket messages
 */
export const connect = (type, data: { project; debug; ip; url }) =>
  type === 'log'
    ? [
        data.debug ? chalk.redBright('[DEBUG MODE]') : '',
        chalk.yellowBright(
          `New client ${chalk.magentaBright(
            data.ip
          )}, for project ${chalk.magentaBright(data.project)},`
        ),
        chalk.yellowBright(`from ${chalk.cyanBright(data.url)}`)
      ]
    : data

/**
 * Websocket compression
 */
export const compression = (
  type,
  data: {
    why
    ip
  }
) =>
  type === 'warn'
    ? chalk.yellowBright(
        data.why === 'disabled'
          ? `Dropped message from client ${chalk.magentaBright(
              data.ip
            )}, because compression is disabled`
          : `Failed to decompress message from client ${chalk.magentaBright(
              data.ip
            )}`
      )
    : data

/**
 * Websocket message parsing
 */
export const parse = (type, data: { ip }) =>
  type === 'warn'
    ? chalk.yellowBright(
        `Failed to parse message from client ${chalk.magentaBright(data.ip)}`
      )
    : data

/**
 * Websocket messages
 */
export const message = (type, data: { ip; error }) =>
  type === 'error'
    ? [
        chalk.yellowBright(
          `Error whilst handling message from client ${chalk.magentaBright(
            data.ip
          )}`
        ),
        data.error
      ]
    : data
