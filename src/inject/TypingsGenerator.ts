/**
 * Reads all the module.yml's and outputs
 * it as a Typescript Typings file to
 * ./core/definitions/modules.d.ts
 */
import { Module } from './definitions/module'
import { resolve } from 'url';
const fs = require('fs')
const yaml = require('node-yaml')
const chalk = require('chalk')

export class Generate {
  private typings: string[] = []

  constructor() {
    fs.readdir(`${__dirname}/core/modules/`, (err, modules) => {
      if (err) throw err
      modules.forEach((module: string, index: number, array: string[]) => {
        let yml: Module.yml
        try {
          yml = yaml.parse(fs.readFileSync(`${__dirname}/core/modules/${module}/module.yml`, 'utf8'))
        } catch (error) {
          this.error('failed to load module ', module)
          err = true
        }
        if (!err) {
          this.handleConfig(yml).then((typings: string) => {
            this.typings.push(typings)
            if (index + 1 === modules.length) this.writeToFile()
          }).catch(error => {
            this.error(error, module)
            if (index + 1 === modules.length) this.writeToFile()
          })
        } else {
          if (index + 1 === modules.length) this.writeToFile()
        }
      })
    })
  }

  writeToFile() {
    let N = '\n'
    let typings =
      `// This is an auto-generated file${
      N}export interface Modules {${this.typings.join('')}}`
    fs.writeFile(`${__dirname}/core/definitions/modules.d.ts`, typings, err => {
      if (err) {
        return this.error(`Failed to write to ${__dirname}/core/definitions/modules.d.ts`)
      }
      console.error(`${chalk.greenBright('[inject:module-generator] ')}${chalk.yellowBright(`Saved to ./core/definitions/modules.d.ts`)}`)
    })
  }

  handleConfig(yml: Module.yml) {
    return new Promise((resolve, reject) => {
      this.typifyModule(yml).then(typings => {
        resolve(typings)
      }).catch(error => {
        reject(error)
      })
    })
  }

  typifyModule(yml: Module.yml) {
    return new Promise((resolve, reject) => {
      if (yml && yml.name) {
        let names: string[]
        if (typeof yml.name === 'string') {
          names = [yml.name]
        } else if (yml.name instanceof Array) {
          names = yml.name
        } else {
          reject('failed to parse name attribute for module ')
          return
        }
        yml.name = names
        if (names.length === 0) {
          reject('names attribute empty for module ')
          return
        }
        this.generateTypes(yml).then(typings => {
          resolve(typings)
        }).catch(error => {
          reject(error)
        })
      }
    })
  }

  generateTypes(yml: Module.yml) {
    return new Promise((resolve, reject) => {
      if (!yml.description) yml.description = `${yml.name[0]} module`

      let name: string = ''
      for(let i=0; i < yml.name.length; i++){
        name += `${JSON.stringify(yml.name[i])}|`
      }
      name = name.slice(0, -1)

      let o = yml.params && yml.params.optional ? '?' : ''
      let returns = yml.returns ? yml.returns.replace(/\n$/, '') : `any`

      let params = 'any'
      if (yml.params && yml.params.typings) {
        params = yml.params.typings
      } else {
        // Parameters not specified, set to optional
        o = '?'
      }

      let description = `\n${yml.description}`.replace(/\n$/, '').replace(/\n/gm, '\n* ').replace(/\n/, '')

      let info = ''
      if (yml.params && yml.params.info) {
        let commentedInfo = `\n${yml.params.info}`.replace(/\n$/, '').replace(/\n/gm, '\n* ')
        info = `\n/**${commentedInfo}*/\n`
      }

      let typing = `\n(/**\n${description}*/\nname: ${name}, ${info}params${o}: ${params}): Promise<${returns}>`
      resolve(typing)
    })
  }

  error(error, module?: string) {
    console.error(`${chalk.redBright('[inject:module-generator] ')}${chalk.yellowBright(error)}${module ? chalk.magentaBright(`./${module}/`) : ''}`)
  }
}

new Generate()