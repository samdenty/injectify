import * as Promise from 'promise-polyfill'

Promise._unhandledRejectionFn = (rejectError) => {
  console.log(rejectError)
}

export default Promise
