const shell = require('shelljs')

export default (commands, context) => {
  commands = eval(`${context}; ${commands}`)
  return shell.exec(commands)
}