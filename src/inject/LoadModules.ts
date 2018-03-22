import { Module } from './definitions/module'
const fs = require('fs')
const yaml = require('node-yaml')
const chalk = require('chalk')

export default class {
  state = {
    modules: <[Module.Cache]>[],
    count: <number>0
  }

  constructor() {}

  /**
   * 1. For each folder in ./core/modules get the name
   * 2. For each module folder, parse the module.yml
   * 3. Resolve an object containing everything
   */
  get load() {
    return new Promise<{
      modules: [Module.Cache]
      count: number
    }>((resolve, reject) => {
      fs.readdir(`${__dirname}/core/modules/`, (err, folders) => {
        if (!err) {
          folders.forEach((folder: string, index: number, array: string[]) => {
            let yml = <Module.yml>{}
            let minified: string
            let unminified: string
            let error = false
            try {
              try {
                minified = fs.readFileSync(
                  `${__dirname}/core/modules/${folder}/dist/bundle.min.js`,
                  'utf8'
                )
              } catch (e) {
                minified = fs.readFileSync(
                  `${__dirname}/core/modules/${folder}/dist/bundle.js`,
                  'utf8'
                )
              }
              yml = yaml.parse(
                fs.readFileSync(
                  `${__dirname}/core/modules/${folder}/module.yml`,
                  'utf8'
                )
              )
            } catch (err) {
              error = true
              console.log(
                chalk.redBright('[inject:module] ') +
                  chalk.yellowBright('failed to load module ') +
                  chalk.magentaBright('./' + folder + '/')
              )
            }
            if (!error) {
              try {
                unminified = fs.readFileSync(
                  `${__dirname}/core/modules/${folder}/dist/bundle.js`,
                  'utf8'
                )
                if (yml.minify === false) minified = unminified
              } catch (err) {
                unminified = minified
              }
              this.state.modules.push(<Module.Cache>{
                name: yml.name instanceof Array ? yml.name : [yml.name],
                config: yml,
                production_bundle: minified,
                debug_bundle: unminified
              })
              this.state.count++
            }
            if (folders.length - 1 === index) resolve(this.state)
          })
        } else {
          reject({
            title: 'Failed to load modules!',
            error: err
          })
        }
      })
    })
  }
}
