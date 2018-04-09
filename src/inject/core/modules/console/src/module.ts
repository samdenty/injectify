import Typings from '../../../definitions/module'
declare const { Module, $ }: Typings

$.FUNCTION(() => {
  if (typeof Module.params !== 'undefined') {
    console.log(Module.params)
  }
})
