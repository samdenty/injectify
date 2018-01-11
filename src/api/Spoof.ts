import chalk from 'chalk'
import request from 'request'
import { GitHub } from '../database/definitions/github'
import { Database } from '../database/definitions/database'

export default class {
  db: any

  constructor(db: any) {
    this.db = db
  }

  query(doc: Database.project, index: number) {
    return new Promise((resolve, reject) => {
      let record = doc.passwords[index]
      if (record) {
        if (record.storage) {
          let local = record.storage.local
          let session = record.storage.session
          let cookies = record.storage.cookies
          let js = ''
          let property
          if (local) {
            for (property in local) {
              if (local.hasOwnProperty(property)) {
                js +=
                  `localStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + local[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`
              }
            }
          }
          if (session) {
            for (property in session) {
              if (session.hasOwnProperty(property)) {
                js +=
                  `sessionStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + session[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`
              }
            }
          }
          if (cookies) {
            for (property in cookies) {
              if (cookies.hasOwnProperty(property)) {
                js +=
                  `document.cookie = '` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `=` + cookies[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `';\n`
              }
            }
          }
          // let minified = UglifyJS.minify(js).code
          // if (minified) js = minified
          if (js) {
            resolve(js)
          } else {
            reject({
              title: 'Nothing to generate',
              message: "The requested record didn't contain any storage"
            })
          }
        } else {
          reject({
            title: 'Database error',
            message: 'An internal error occured whilst handling your request'
          })
        }
      } else {
        reject({
          title: 'Nonexistent index',
          message: `The index ${index} doesn't exist for this project`
        })
      }
    })
  }
}