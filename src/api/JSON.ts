declare const global: any
import { Database } from '../database/definitions/database'

export default class {
  db: any

  constructor(db: any) {
    this.db = db
  }

  query(doc: Database.project, page: string) {
    return new Promise((resolve, reject) => {
      if (page === 'clients') {
        resolve(
          JSON.stringify(global.inject.clients[doc._id] || {}, null, '  ')
        )
      } else if (page === 'data') {
        resolve(JSON.stringify(doc[page], null, '  '))
      } else {
        reject({
          title: 'Database error',
          message: 'An internal error occured whilst handling your request'
        })
      }
    })
  }
}
