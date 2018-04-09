import Typings from '../../../definitions/module'
declare const { injectify, Module, $ }: Typings

Module.resolve($.WRITE(`${injectify.info.ip.query}.txt`, Module.params))
