import resolve from './resolve'
import passthru from './passthru'

export default function(data, context) {
	return passthru.apply(null, resolve(data, context))
}