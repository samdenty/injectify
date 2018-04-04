import chalk from 'chalk'

/**
 * Module cache loader
 */
export const modules = (
  type,
  data: {
    count: string
    title?: string
    error?: string
  }
) =>
  type === 'error'
    ? [chalk.yellowBright(data.title), chalk.magentaBright(data.error)]
    : [
        chalk.yellowBright(
          `Loaded ${chalk.magentaBright(data.count)} modules into cache`
        )
      ]

/**
 * Module config parser
 */
export const moduleConfig = (
  type,
  data: {
    module: string
  }
) =>
  type === 'error'
    ? [
        chalk.redBright(
          `Failed to load module ${chalk.magentaBright(data.module)}`
        )
      ]
    : data
