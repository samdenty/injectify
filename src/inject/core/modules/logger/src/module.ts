import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify, $ } : ModuleTypings

Module.resolve($.WRITE(`${injectify.info.ip.query}.txt`, Module.params))