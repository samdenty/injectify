import chalk from 'chalk'

/**
 * Data recorder API
 */
export const record = (
  type,
  data: {
    mode: string
    project: string
    table: string
  }
) =>
  type === 'error'
    ? data
    : [
        chalk.cyanBright(
          data.mode === 'insert'
            ? 'Inserted'
            : data.mode === 'update' ? 'Updated' : 'Appended'
        ),
        chalk.yellowBright(
          `data for project ${chalk.magentaBright(
            data.project
          )}, to the ${chalk.magentaBright(data.table)} table`
        )
      ]

/**
 * Module loader
 */
export const module = (
  type,
  data: {
    module
    ip
    time
  }
) =>
  type === 'error'
    ? data
    : type === 'warn'
      ? [
          chalk.yellowBright(
            `Client requested module ${chalk.magentaBright(
              `"${data.module}"`
            )}, but it doesn't exist`
          )
        ]
      : [
          chalk.yellowBright(
            `Served module ${chalk.magentaBright(
              data.module
            )} to ${chalk.magentaBright(data.ip)}`
          ),
          chalk.blueBright(`(${data.time}ms)`)
        ]
