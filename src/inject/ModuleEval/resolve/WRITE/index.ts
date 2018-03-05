import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

function write(name: string, filename: string, data: string) {
  let directory = path.join(__dirname, `../../../core/modules/${name}/data/`)
  let file = path.join(directory, filename)
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory)
  }
  fs.appendFile(file, JSON.stringify(data) + '\n', (err) => {
    if (err) throw err
    // @ts-ignore
    if (global.config.verbose) {
      console.log(
        chalk.greenBright(`[inject:module] `) +
        chalk.yellowBright(`Wrote data from module `) +
        chalk.magentaBright(name) +
        chalk.yellowBright(` to disk, as file `) +
        chalk.magentaBright(filename)
      )
    }
  })
}

export default (commands, context) => {
  eval(`${context}; write(Module.name, ${commands})`)
}
