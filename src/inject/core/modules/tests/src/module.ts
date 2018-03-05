import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify, $ }: ModuleTypings
// @ts-ignore
import * as isEqual from 'fast-deep-equal'

let i = 0
function test(result, spec, validIfStartsWith?: boolean) {
  i++
  if ((validIfStartsWith && result.startsWith(spec)) || (!isEqual(result, spec))) {
    throw {
      test: i,
      result: JSON.stringify(result),
      spec: JSON.stringify(spec)
    }
  }
}

;(function tests() {
  try {
    /**
     * Server execution unit tests

     * test (RESULT | SPEC)
     * ^-------------------- Function that compares results
     *       ^-------------- The freshly generated result
     *                ^----- What the result should be
     */
    // Any types
    //1   | Any type [Bool]
    test($._(2 > 1), true)
    //2   | Any type [Number]
    test($._(122 + 1), 123)
    //3   | Any type [Object]
    test($._({any: 'type'}), { any: 'type' })
    //4   | Any type [Array]
    test($._([1,2,3]), [1,2,3])
    //5   | Any type [String]
    test($._("test"), 'test')
    //6   | Any type [Func]
    test($._(() => { return 'Function success'}), "Function success")


    // APIs
    //7   | Command line
    test($.SHELL('echo Hello from the command line'), 'Hello from the command line', true)


    // Types escaped in strings
    //8   | String function1
    test($.FUNCTION('return 123'), 123)
    //9   | String function2
    test($.FUNCTION(`return 123`), 123)
    //10  | String boolean
    test($.BOOLEAN("2 > 1"), true)
    //11  | String string
    test($.STRING('test'), 'test')
    //12  | String array
    test($.ARRAY("[1,2,3]"), [1,2,3])
    //13  | String object
    test($.OBJECT(`{a: 'b'}`), {a: 'b'})
    //14  | String number
    test($.NUMBER(`122 + 1`), 123)


    // Types expressed literally
    //15  | Function
    test($.FUNCTION(() => { return 'success'}), 'success')
    //16  | String
    test($.STRING("test"), 'test')
    //17  | Boolean
    test($.BOOLEAN(2 > 1), true)
    //18  | Array
    test($.ARRAY([1,2,3]), [1,2,3])
    //19  | Object
    test($.OBJECT({a:'success'}), {a: 'success'})
    //20  | Number
    test($.NUMBER(122 + 1), 123)

    // Complex tests
    //21  | Lodash
    test($.FUNCTION(`() => {
      const _ = require('lodash')
      let ownerArr = [{
          "owner": "Colin",
          "pets": [{"name":"dog1"}, {"name": "dog2"}]
      }, {
          "owner": "John",
          "pets": [{"name":"dog3"}, {"name": "dog4"}]
      }]

      return _.map(ownerArr, 'pets[0].name');
    }`), ['dog1', 'dog3'])
    //22  | Function #1
    test($.FUNCTION(() => { return "success"}), 'success')
    //23  | Function #2
    test($.FUNCTION(`() => { return "success"}`), 'success')
    //24  | Function #3
    test($.FUNCTION(`return "success"`), 'success')


    console.log(`All ${i} tests passed ✅\n\nClick on the code to inspect`, tests)
    Module.resolve(true)
  } catch (e) {
    if (e instanceof Object && e.test) {
      let { test, spec, result } = e
console.error(`Test #${test} failed! ❌
-----------------------------

\tResult  : ${result}
\tExpected: ${spec}

-----------------------------
Click on the code to inspect`, tests)
    } else {
      console.error('Tests failed! ❌\n', e, '\n\nClick on the code to inspect', tests)
    }
    Module.reject(false)
  }
})()
