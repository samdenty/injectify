import { Injectify } from '../../../definitions/core'
import TypeParser from './TypeParser'
import Hook from './Hook'
declare const injectify: typeof Injectify

export default class {
  static hook = Hook

  static log(message: any) {
    injectify.send('l', {
      type: 'info',
      message: new TypeParser(Array.prototype.slice.call(arguments))
    })
  }

  static warn(message: any) {
    injectify.send('l', {
      type: 'warn',
      message: new TypeParser(Array.prototype.slice.call(arguments))
    })
  }

  static error(message: any) {
    injectify.send('l', {
      type: 'error',
      message: new TypeParser(Array.prototype.slice.call(arguments))
    })
  }

  static result(message: any) {
    injectify.send('l', {
      type: 'return',
      message: new TypeParser(Array.prototype.slice.call(arguments))
    })
  }

  static table(message: any) {
    injectify.send('l', {
      type: 'table',
      message: new TypeParser(Array.prototype.slice.call(arguments))
    })
  }
}