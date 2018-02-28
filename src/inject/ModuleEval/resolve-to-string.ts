import resolve from './resolve'
import passthru from './passthru'

export default function(data) {
	return passthru.apply(null, resolve(data))
}