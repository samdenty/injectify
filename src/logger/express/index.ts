import chalk from 'chalk'

/**
 * Express attach event
 */
export const attach = (
  type,
  data: {
    port: string
  }
) =>
  type === 'error'
    ? data
    : [chalk.yellowBright(`Listening on port ${chalk.cyanBright(data.port)}`)]
