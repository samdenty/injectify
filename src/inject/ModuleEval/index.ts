import compile from './compile'
import resolve from './resolve-to-string'
import * as CircularJSON from 'circular-json'
import * as _ from 'lodash'

const methods = [
  '_',
  'SHELL',
  'FUNCTION',
  'OBJECT',
  'NUMBER',
  'STRING',
  'WRITE',
  'BOOLEAN',
  'ARRAY',
]

export default (code, context): string => {
  let varContext = _.map(context, (data, variable) => {
    let value = data !== null && data !== undefined ? CircularJSON.stringify(data) : data
    return `var ${variable}=${value}`
  }).join(';')

  methods.map(method => {
    code = code.split(`$.${method}(`).join(`Δ("${method}",`)
  })
  return resolve(compile(code), varContext)
}
