import { SocketSession } from './definitions/session'

import getIP from '../lib/getIP'
const { flag } = require('country-emoji')
const geoip = require('geoip-lite')
const parseAgent = require('user-agent-parser')
const twemoji = require('twemoji')

export default (req: any, authReq: any, session: SocketSession.session) => {
  return new Promise((resolve) => {
    /**
     * Gather details about the connection
     */
    let platform = 'browser'
    let browser = '/assets/svg/default.svg'
    let country = 'https://twemoji.maxcdn.com/2/svg/2753.svg'

    let ip
    try {
      ip = {
        query: req.headers['x-forwarded-for'].split(',')[0]
      }
    } catch (e) {
      ip = {
        query: getIP(req.connection.remoteAddress)
      }
    }
    let parsedIP = geoip.lookup(ip.query)
    if (parsedIP) {
      parsedIP.query = ip.query
      ip = parsedIP
      country = 'https://twemoji.maxcdn.com/2/svg/' + twemoji.convert.toCodePoint(flag(ip.country)) + '.svg'
    }

    let agent = parseAgent(req.headers['user-agent'])
    let os = <any> false

    /**
     * Parse user-agent from the Injectify Electron application
     */
    if (req.headers['user-agent'] && req.headers['user-agent'].startsWith('{')) {
      try {
        os = JSON.parse(req.headers['user-agent'])
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
    if (!os && req.headers['user-agent']) {
      if (req.headers['user-agent'].includes('SamsungBrowser')) {
        browser = '/assets/svg/samsung.svg'
      } else if (req.headers['user-agent'].includes('Edge')) {
        browser = '/assets/svg/edge.svg'
      } else if (req.headers['user-agent'].includes('Trident')) {
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

    /**
     * Client object
     */
    // Note: this only provides the root domain, not the actual path
    // But I guess it's better than nothing
    // I should probably send location.href in the authentication request
    const url = authReq.headers.referer || req.headers.origin || '[N/A]'
    resolve({
      client: {
        'user-agent': agent,
        'ip': ip,
        'platform': platform,
        'os': os,
        'images': {
          'country': country,
          'browser': browser
        },
        'sessions': [

        ],
        'watchers': []
      },
      session: {
        'id': session.id,
        'debug': session.debug,
        'window': {
          'title': url,
          'url': url,
          'favicon': `https://plus.google.com/_/favicon?domain_url=${encodeURIComponent(url)}`,
          'active': false
        },
        'devtools': {
          'open': false,
          'orientation': null
        },
        'socket': {
          'headers': req.headers,
          'id': req.id,
          'remoteAddress': req.socket.remoteAddress,
          'remotePort': req.socket.remotePort,
          'url': req.url
        }
      }
    })
  })
}
