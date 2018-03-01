import compile from './compile'
import resolve from './resolve-to-string'

const methods = [
	'_',
	'SHELL',
	'FUNCTION',
	'OBJECT',
	'NUMBER',
	'STRING',
	'BOOLEAN',
	'ARRAY',
]

export default (code): string => {
	methods.map(method => {
		code = code.split(`$.${method}(`).join(`Δ("${method}",`)
	})
	return resolve(compile(code))
}
