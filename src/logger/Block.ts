import chalk from 'chalk'

export default function Block(string: string, color: Function, end: boolean = false) {
  const spacing = ''.padStart(10 - string.length)
  if (!end) string += spacing
  let parsed = typeof color === 'function' ? color(` ${string} `) : string
  if (end) parsed += spacing
  return parsed + chalk.redBright(end ? '→' : '')
}
