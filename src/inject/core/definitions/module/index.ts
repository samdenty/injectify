import { ServerExecution } from './ServerExecution'
import { CurrentScope } from './CurrentScope'
declare const __CurrentScope__: CurrentScope

export const injectify = __CurrentScope__.injectify
export const Module = __CurrentScope__.Module

export { ServerExecution } from './ServerExecution'
export { ServerResponse } from './ServerResponse'

// Alternative typings
export default interface Typed {
  injectify: typeof __CurrentScope__.injectify
  Module: typeof __CurrentScope__.Module
  $: ServerExecution
}
