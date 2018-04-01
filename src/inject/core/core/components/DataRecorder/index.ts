import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
import Promise from '../../lib/Promise'

interface Record {
  table: string
  data?: any
}

interface Insert extends Record {
  mode?: 'insert'
}

interface Update extends Record {
  mode: 'update'
}

interface Append extends Record {
  mode: 'append'
}

type Request = Insert | Update | Append

export default class {
  static record(req: string | Request, data?: any) {
    return new Promise((resolve, reject) => {
      /**
       * Parse the request
       */
      const request =
        typeof req === 'string'
          ? <Insert>{
              table: req,
              mode: 'insert',
              data
            }
          : {
              data,
              ...req
            }

      injectify.send('r', request)
      resolve({
        get value() {
          alert(1)
          return 'a'
        }
      })
    })
  }
}
