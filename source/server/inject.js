const yaml      = require('node-yaml')
const chalk     = require('chalk')
const UglifyJS  = require("uglify-es")
const fs        = require('fs')

exports.loadModules = callback => {
    let modules     = {},
        debugModules= {},
        moduleCount = 0
    fs.readdir('./inject/modules/', (err, files) => {
        if (err) {
            console.error("Failed to load modules!", err)
            process.exit(1)
        }
        files.forEach((folder, index, array) => {
            let yml = {}, js
            try {
                js  = fs.readFileSync('./inject/modules/' + folder + '/module.js', 'utf8')
                yml = yaml.parse(fs.readFileSync('./inject/modules/' + folder + '/module.yml', 'utf8'))
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
                    console.error(
                        chalk.redBright('[inject:module] ') +
                        chalk.yellowBright('failed to load module ') +
                        chalk.magentaBright('./' + folder + '/')
                    )
                    return
                }
            }
            let unminified = js
            let minified = UglifyJS.minify(js).code
            if (minified && yml.minify !== false) js = minified
            modules[yml.name] = js
            debugModules[yml.name] = unminified
            moduleCount++
            if (files.length - 1 == index) callback(modules, debugModules, moduleCount)
        })
    })
}