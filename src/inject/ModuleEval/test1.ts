import ModuleEval from './index'
let r = ModuleEval(`
Any types
  | Any type [Bool]   : $._(2 > 1)
  | Any type [Number] : $._(122 + 1)
  | Any type [Object] : $._({any: 'type'})
  | Any type [Array]  : $._([1,2,3])
  | Any type [String] : $._("test")
  | Any type [Func]   : $._(() => { return 'Function success'})

APIs
  | Command line      : $.SHELL('echo Hello from the command line')

Types escaped in strings
  | String function1  : $.FUNCTION('return 123')
  | String function2  : $.FUNCTION(\`return 123\`)
  | String boolean    : $.BOOLEAN("2 > 1")
  | String string     : $.STRING('test')
  | String array      : $.ARRAY("[1,2,3]")
  | String object     : $.OBJECT(\`{a: 'b'}\`)
  | String number     : $.NUMBER(\`122 + 1\`)

Types expressed literally
  | Function          : $.FUNCTION(() => { return 'success'})
  | String            : $.STRING("test")
  | Boolean           : $.BOOLEAN(2 > 1)
  | Array             : $.ARRAY([1,2,3])
  | Object            : $.OBJECT({a:'success',time:+new Date()})
  | Number            : $.NUMBER(122 + 1)

Complex tests
  | Lodash            : $.FUNCTION(() => {
    const _ = require('lodash')
    let ownerArr = [{
        "owner": "Colin",
        "pets": [{"name":"dog1"}, {"name": "dog2"}]
    }, {
        "owner": "John",
        "pets": [{"name":"dog3"}, {"name": "dog4"}]
    }]

    return _.map(ownerArr, 'pets[0].name');
  })
  | System info       : $.FUNCTION(() => {
    const os = require('os')
    return {
      platform: os.platform(),
      uptime: os.uptime(),
    }
  })
  | Function #1      : $.FUNCTION(() => { return "success"})
  | Function #2      : $.FUNCTION(\`() => { return "success"}\`)
  | Function #3      : $.FUNCTION(\`return "success"\`)
`)
console.log(`
 Injectify server-side module execution tests
-----------------------------------------------
${r}`)
