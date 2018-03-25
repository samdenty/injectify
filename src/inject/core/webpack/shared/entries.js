// @ts-check
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const modules = glob.sync('./modules/*/')

module.exports = (ext) => {
  /**
   * Core entry points
   */
  const entry = {
    [`bundle.${ext}`]: './core/App.ts'
  }

  /**
   * Module entry points
   */
  for (let i = 0; i < modules.length; i++) {
    let module = modules[i].split('/')[2]
    let path = `./modules/${module}`
    let file
    if (fs.existsSync(`${path}/src/module.tsx`)) {
      file = 'module.tsx'
    } else if (fs.existsSync(`${path}/src/module.ts`)) {
      file = 'module.ts'
    } else if (fs.existsSync(`${path}/src/module.js`)) {
      file = 'module.js'
    }
    if (file) {
      entry[`${path}/dist/bundle.${ext}`] = `${path}/src/${file}`
    }
  }
  return entry
}
