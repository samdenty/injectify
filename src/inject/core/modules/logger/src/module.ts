import { Module, injectify, ServerExecution } from '../../../definitions/module'
declare const $: ServerExecution

Module.resolve($.WRITE(`${injectify.info.ip.query}.txt`, Module.params))
