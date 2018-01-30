import { Injectify } from './core'

export default class {
  module: {
    name: string
    token: string
    callback: Function
    returned: any
    config: {
      async: boolean
    }
    params: any
    return(any): Function
  }
  injectify: typeof Injectify
}