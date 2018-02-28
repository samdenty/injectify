import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify, $ }: ModuleTypings
;(function tests() {
  try {
    // $ (true)
    let test1 = $(true)

    // $ ({ test: true })
    let test2 = $({ test: true })

    // $ ([true])
    let test3 = $([true])

    // $ ($ (`return true`))
    let test4 = $($(`return true`))

    // $ ('test')
    let test5 = $('test')

    // $ ($ (`return shell.exec('echo Tests module success!')`))
    let test6 = $($(`return shell.exec('echo Tests module success!')`))

    if (test1 !== true) {
      Module.reject(false)
      console.error('Test1 failed! ❌\n\nClick on the code to inspect', tests)
    } else if (test2.test !== true) {
      Module.reject(false)
      console.error('Test2 failed! ❌\n\nClick on the code to inspect', tests)
    } else if (test3[0] !== true) {
      Module.reject(false)
      console.error('Test3 failed! ❌\n\nClick on the code to inspect', tests)
    } else if (test4 !== true) {
      Module.reject(false)
      console.error('Test4 failed! ❌\n\nClick on the code to inspect', tests)
    } else if (test5 !== 'test') {
      Module.reject(false)
      console.error('Test5 failed! ❌\n\nClick on the code to inspect', tests)
    } else if (test6 !== 'Tests module success!\r\n') {
      Module.reject(false)
      console.error('Test6 failed! ❌\n\nClick on the code to inspect', tests)
    } else {
      console.log('Tests passed ✅\n\nClick on the code to inspect', tests)
      Module.resolve(true)
    }
  } catch (e) {
    Module.reject(false)
    console.error('Tests failed! ❌\n\nClick on the code to inspect', e)
  }
})()
