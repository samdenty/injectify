import compile from './compile'
import resolve from './resolve-to-string'

export default function(code) {
	return resolve(compile(code))
}
