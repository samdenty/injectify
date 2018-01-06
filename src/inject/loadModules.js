/* eslint-disable no-ex-assign */
const fs = require('fs')
const yaml = require('node-yaml')
const chalk = require('chalk')
const UglifyJS = require('uglify-es')

module.exports = callback => {
  let modules = {}
  let debugModules = {}
  let moduleCount = 0
  fs.readdir(`${__dirname}/modules/`, (err, folders) => {
    if (err) {
      console.error('Failed to load modules!', err)
      process.exit(1)
    }
    folders.forEach((folder, index, array) => {
      let yml = {}
      let js
      let error = false
      try {
        js = fs.readFileSync(`${__dirname}/modules/` + folder + '/module.js', 'utf8')
        yml = yaml.parse(fs.readFileSync(`${__dirname}/modules/` + folder + '/module.yml', 'utf8'))
      } catch (error) {
        if (js && !yml.name) {
          // Attempt to load module in basic mode
          console.warn(
            chalk.yellowBright('[inject:module] ') +
            chalk.yellowBright('missing configuration for ') +
            chalk.magentaBright('./' + folder + '/') +
            chalk.yellowBright(', it may misbehave')
          )
          yml.name = folder
        } else {
          error = true
          console.error(
            chalk.redBright('[inject:module] ') +
            chalk.yellowBright('failed to load module ') +
            chalk.magentaBright('./' + folder + '/')
          )
        }
      }
      if (!error) {
        let unminified = js
        let minified = UglifyJS.minify(js).code
        if (minified && yml.minify !== false) js = minified
        if (typeof yml.name === 'object') {
          for (var i in yml.name) {
            modules[yml.name[i]] = js
            debugModules[yml.name[i]] = unminified
          }
        } else {
          modules[yml.name] = js
          debugModules[yml.name] = unminified
        }
        moduleCount++
      }
      if (folders.length - 1 === index) callback(modules, debugModules, moduleCount)
    })
  })
}
