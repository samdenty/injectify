import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default class {
  static record(table: string, data: any) {
    if (typeof table === 'string' && typeof data !== 'undefined') {
      injectify.send('r', {
        table: table,
        data: data
      })
    }
  }
}