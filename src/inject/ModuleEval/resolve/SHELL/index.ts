const shell = require('shelljs')

export default (commands) => {
  return shell.exec(commands)
}