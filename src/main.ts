/* eslint-disable prefer-promise-reject-errors */
declare const global: any

const MongoClient = require('mongodb').MongoClient
import * as fs from 'fs-extra'
import chalk from 'chalk'
import * as path from 'path'
import * as request from 'request'
import * as atob from 'atob'
import * as btoa from 'btoa'
import * as cookieParser from 'cookie-parser'
import * as RateLimit from 'express-rate-limit'
import * as pretty from 'express-prettify'

import Logger from './logger'
import apiHandler from './api/handler'
import LocalTunnel from './network/LocalTunnel'
import injectHandler from './inject/handler'
import getIP from './lib/getIP.js'
import Update from './database/Project/Update'

/**
 * Read configuration
 */
if (!fs.existsSync('./server.config.js')) {
  if (fs.existsSync('./server.config.example.js')) {
    fs.copySync('./server.config.example.js', './server.config.js')
  } else {
    console.error(
      chalk.redBright(
        `Failed to start! ${chalk.magentaBright(
          './server.config.js'
        )} and ${chalk.magentaBright('./server.config.example.js')} are missing`
      )
    )
  }
}

const config = (global.config = require('../server.config.js').injectify)
const express = require('express')
const app = express()
const server = app.listen(config.express)
const io = require('socket.io').listen(server)
const apiLimiter = new RateLimit(config.rateLimiting.api)
const injectLimiter = new RateLimit(config.rateLimiting.inject.auth)

Logger(['express', 'attach'], 'log', {
  port: config.express
})

process.on('unhandledRejection', (error) => {
  console.error(
    chalk.redBright('[Promise] ') + ' Unhandled Rejection:',
    error
  )
})

MongoClient.connect(config.mongodb, (err, client) => {
  if (err) throw err
  const db = (global.db = client.db('injectify'))
  const api = new apiHandler(db)
  let Inject = new injectHandler(server, db)
  let inject = (global.inject = Inject.state)

  app.set('json spaces', 2)

  server.on('upgrade', (req, socket, head) => {
    if (req.url && req.url.startsWith('/i')) {
      Inject.server.handleUpgrade(req, socket, head, (ws) => {
        Inject.connectionHandler(ws, req)
      })
    }
  })

  io.on('connection', (socket) => {
    let globalToken
    let state = {
      previous: '',
      page: '',
      refresh: null
    }
    let watchers = {
      inject: null,
      client: null
    }
    var getToken = (code) => {
      return new Promise((resolve, reject) => {
        if (!code) {
          reject(Error('Failed to authenticate account, null code'))
        } else {
          request(
            {
              url: 'https://github.com/login/oauth/access_token',
              method: 'POST',
              headers: {
                Accept: 'application/json'
              },
              qs: {
                client_id: config.github.client_id,
                client_secret: config.github.client_secret,
                code: code
              }
            },
            (error, response, github) => {
              try {
                github = JSON.parse(github)
              } catch (e) {
                console.log(
                  chalk.redBright('[websocket] ') +
                    chalk.yellowBright('failed to retrieve token '),
                  github
                )
                console.error(e)
                reject(Error('Failed to parse GitHub response'))
              }
              if (
                !error &&
                response.statusCode === 200 &&
                github.access_token
              ) {
                resolve(github.access_token)
              } else {
                reject(
                  Error(
                    'Failed to authenticate account, invalid code => ' + code
                  )
                )
              }
            }
          )
        }
      })
    }
    var getUser = (token) => {
      return new Promise((resolve, reject) => {
        request(
          {
            url:
              'https://api.github.com/user',
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `token ${token}`,
              'User-Agent': 'Injectify'
            }
          },
          (error, response, user) => {
            if (error) {
              console.error(error)
              return
            }
            try {
              user = JSON.parse(user)
            } catch (e) {
              console.error(
                chalk.redBright('[websocket] ') +
                  chalk.yellowBright('failed to retrieve user API ')
              )
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
          }
        )
      })
    }
    var database = (user) => {
      return new Promise((resolve, reject) => {
        db.collection('users', (err, users) => {
          if (err) throw err
          users
            .findOne({
              id: user.id
            })
            .then((doc) => {
              resolve(doc)
            })
        })
      })
    }
    var login = (user, token, loginMethod) => {
      return new Promise((resolve, reject) => {
        db.collection('users', (err, users) => {
          if (err) throw err
          users
            .findOne({
              id: user.id
            })
            .then((doc) => {
              let ipAddress = getIP(socket.handshake.address)
              if (socket.handshake.headers['x-forwarded-for'])
                ipAddress = getIP(
                  socket.handshake.headers['x-forwarded-for'].split(',')[0]
                )
              if (doc !== null) {
                // User exists in database
                users
                  .updateOne(
                    {
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
                    }
                  )
                  .then(() => {
                    resolve()
                  })
              } else {
                // User doesn't exist in database
                users.insertOne(
                  {
                    username: user.login,
                    id: user.id,
                    github: user,
                    logins: [
                      {
                        timestamp: new Date(),
                        ip: ipAddress,
                        token: token,
                        login_type: loginMethod
                      }
                    ]
                  },
                  (err, res) => {
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
                        request(
                          {
                            url: `https://api.github.com/user/following/${
                              config.follow.username
                            }`,
                            method: 'PUT',
                            headers: {
                              Authorization: `token ${token}`,
                              'User-Agent': 'Injectify'
                            }
                          },
                          (error, response) => {
                            if (error) throw error
                            resolve()
                          }
                        )
                      }
                    }
                  }
                )
              }
            })
        })
      })
    }
    var newProject = (project, user) => {
      return new Promise((resolve, reject) => {
        database(user)
          .then((dbUser) => {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects
                .find({
                  $or: [
                    {
                      'permissions.owners': user.id
                    }
                  ]
                })
                .count()
                .then((count: number) => {
                  projects
                    .findOne({
                      name: project
                    })
                    .then((doc) => {
                      if (doc == null) {
                        // Project doesn't exist in database
                        projects.insertOne(
                          {
                            name: project,
                            permissions: {
                              owners: [user.id],
                              admins: [],
                              readonly: []
                            },
                            console: {},
                            config: {
                              autoexecute: `injectify.module('passwords')`,
                              filter: {
                                type: 'whitelist',
                                domains: []
                              },
                              created_at: new Date()
                            },
                            data: {
                              passwords: []
                            }
                          },
                          (err, res) => {
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
                                message: `Created project '${project}'`
                              })
                            }
                          }
                        )
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
                })
                .catch((error) => {
                  reject({
                    title: 'Database error',
                    message:
                      'An internal error occured whilst handling your request'
                  })
                  throw error
                })
            })
          })
          .catch((error) => {
            reject({
              title: 'Database error',
              message: 'An internal error occured whilst handling your request'
            })
            throw error
          })
      })
    }
    var getProjects = (user) => {
      return new Promise((resolve, reject) => {
        db.collection('projects', (err, projects) => {
          if (err) throw err
          let projectsWithAccess = []
          projects
            .find({
              $or: [
                {
                  'permissions.owners': user.id
                },
                {
                  'permissions.admins': user.id
                },
                {
                  'permissions.readonly': user.id
                }
              ]
            })
            .sort({
              name: 1
            })
            .forEach(
              (doc) => {
                if (doc !== null) {
                  projectsWithAccess.push({
                    name: doc.name,
                    permissions: doc.permissions
                  })
                }
              },
              (error) => {
                if (error) throw error
                if (projectsWithAccess.length > 0) {
                  resolve(projectsWithAccess)
                } else {
                  reject('no projects saved for user ' + user.id)
                }
              }
            )
        })
      })
    }
    var getProject = (name, user) => {
      return new Promise((resolve, reject) => {
        db.collection('projects', (err, projects) => {
          if (err) throw err
          projects
            .findOne({
              $or: [
                {
                  'permissions.owners': user.id
                },
                {
                  'permissions.admins': user.id
                },
                {
                  'permissions.readonly': user.id
                }
              ],
              $and: [
                {
                  name: name
                }
              ]
            })
            .then((doc) => {
              if (doc !== null) {
                let myPermissionLevel = 3
                if (doc.permissions.owners.includes(user.id)) {
                  myPermissionLevel = 1
                } else if (doc.permissions.admins.includes(user.id)) {
                  myPermissionLevel = 2
                }
                resolve({
                  doc,
                  myPermissionLevel
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
    var unwatch = (type) => {
      if (
        type === 'client' &&
        watchers.client &&
        inject.clients[watchers.client.id][watchers.client.token] &&
        inject.clients[watchers.client.id][watchers.client.token].watchers
      )
        inject.clients[watchers.client.id][
          watchers.client.token
        ].watchers.forEach((watcher, i) => {
          if (watcher.socket === socket.id) {
            inject.clients[watchers.client.id][
              watchers.client.token
            ].watchers.splice(i, 1)
          }
        })

      if (type === 'inject' && watchers.inject)
        inject.watchers[watchers.inject] = inject.watchers[
          watchers.inject
        ].filter((watcher) => {
          return watcher.id !== socket.id
        })
    }

    /**
     * Send server info to client
     */
    socket.emit('server:info', {
      github: {
        client_id: config.github.client_id,
        scope: config.github.scope
      },
      discord: config.discord && config.discord.widgetbot
    })

    socket.on('auth:github', (data) => {
      if (data.code) {
        // Convert the code into a user-token
        getToken(data.code)
          .then((token) => {
            if (config.debug) {
              console.log(
                chalk.greenBright('[GitHub] ') +
                  chalk.yellowBright('retrieved token ') +
                  chalk.magentaBright(token)
              )
            }
            // Convert the token into a user object
            getUser(token)
              .then((user) => {
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
                login(user, token, 'manual')
                  .then(() => {
                    getProjects(user)
                      .then((projects) => {
                        socket.emit('user:projects', projects)
                      })
                      .catch((error) => {
                        if (config.debug)
                          console.log(chalk.redBright('[database] '), error)
                      })
                  })
                  .catch((error) => {
                    console.log(chalk.redBright('[database] '), error)
                    socket.emit('database:registration', {
                      success: false,
                      message: error
                    })
                  })
              })
              .catch((error) => {
                console.log(chalk.redBright('[auth:github] '), error.message)
                socket.emit('err', {
                  title: error.title,
                  message: error.message
                })
              })
          })
          .catch((error) => {
            console.log(chalk.redBright('[auth:github] '), error.message)
            socket.emit('err', {
              title: error.title,
              message: error.message
            })
          })
      }
    })

    socket.on('auth:signout', (data) => {
      globalToken = ''
      state = {}
      if (watchers.inject) {
        inject.watchers[watchers.inject] = inject.watchers[
          watchers.inject
        ].filter((watcher) => {
          return watcher.id !== socket.id
        })
      }
    })

    socket.on('auth:github/token', (token) => {
      if (token) {
        // Convert the token into a user object
        getUser(token)
          .then((user) => {
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
            login(user, token, 'automatic')
              .then(() => {
                getProjects(user)
                  .then((projects) => {
                    socket.emit('user:projects', projects)
                  })
                  .catch((error) => {
                    if (config.debug)
                      console.log(chalk.redBright('[database] '), error)
                  })
              })
              .catch((error) => {
                console.log(chalk.redBright('[database] '), error)
                socket.emit('database:registration', {
                  success: false,
                  message: error.toString()
                })
              })
          })
          .catch((error) => {
            // Signal the user to re-authenticate their GitHub account
            console.log(chalk.redBright('[auth:github/token] '), error.message)
            socket.emit('auth:github/stale', {
              title: error.title.toString(),
              message: error.message.toString(),
              token
            })
          })
      }
    })

    socket.on('github:star', (action) => {
      if (globalToken) {
        if (action === 'star' || action === 'unstar') {
          request(
            {
              url: `https://api.github.com/user/starred/samdenty99/injectify`,
              method: action === 'star' ? 'PUT' : 'DELETE',
              headers: {
                Authorization: `token ${globalToken}`,
                'User-Agent': 'Injectify'
              }
            },
            (error, response) => {
              if (error) throw error
            }
          )
        }
      } else {
        socket.emit('err', {
          title: 'Failed',
          message: 'You need to sign in with GitHub first'
        })
      }
    })

    socket.on('project:create', (project) => {
      if (project.name && globalToken) {
        if (project.name.length > 50) {
          socket.emit('err', {
            title: 'Failed to create project',
            message: 'Project name must be under 50 characters'
          })
          return
        }
        getUser(globalToken)
          .then((user) => {
            newProject(project.name, user)
              .then((data) => {
                socket.emit('notify', {
                  title: data.title,
                  message: data.message,
                  id: data.id
                })
                getProjects(user)
                  .then((projects) => {
                    socket.emit('user:projects', projects)
                  })
                  .catch((error) => {
                    if (config.debug)
                      console.log(chalk.redBright('[database] '), error)
                  })
              })
              .catch((e) => {
                socket.emit('err', {
                  title: e.title,
                  message: e.message,
                  id: e.id
                })
              })
          })
          .catch((error) => {
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

    socket.on('project:read', (data) => {
      let { project, page } = data
      let pages = ['overview', 'console', 'data', 'config']

      if (globalToken) {
        if (project && page && pages.includes(page)) {
          state.page = page
          state.project = project
          clearTimeout(state.refresh)
          getUser(globalToken)
            .then((user) => {
              /**
               * Fetch the user from the database
               */
              database(user).then((dbUser) => {
                ;(function check() {
                  /**
                   * Make sure they are still on the same page and same project
                   */
                  if (state.page !== page || state.project !== project) return
                  /**
                   * Fetch the project from the database
                   */
                  getProject(project, user)
                    .then((doc) => {
                      doc = doc.doc
                      /**
                       * Iterates over the pages array and removes elements
                       * from the doc that don't match the requested page
                       */
                      for (let p of pages) {
                        if (p !== page) {
                          delete doc[p]
                        }
                      }

                      let currentState = JSON.stringify(doc)
                      if (state.previous !== currentState) {
                        state.previous = currentState

                        /**
                         * Parse the raw entries back into objects
                         */
                        if (doc.data) {
                          for (let table of Object.keys(doc.data)) {
                            for (let i in doc.data[table]) {
                              let entry = doc.data[table][i]
                              if ('data' in entry) {
                                try {
                                  entry.data = JSON.parse(entry.data)
                                } catch (e) {}
                              }
                            }
                          }
                        }
                        socket.emit('project:read', {
                          page,
                          doc
                        })
                      }
                      /**
                       * Check
                       */
                      state.refresh = setTimeout(check, 1000)
                    })
                    .catch((e) => {
                      // User doesn't have permission access the project
                      socket.emit('err', {
                        title: e.title,
                        message: e.message
                      })
                    })
                })()
              })
            })
            .catch((error) => {
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

    socket.on('project:modify', (data) => {
      let command = data.command
      let project = data.project
      var convertToID = (type, value) => {
        return new Promise((resolve, reject) => {
          if (type === 'id') {
            request(
              {
                url:
                  'https://api.github.com/user/' +
                  encodeURIComponent(value) +
                  '?client_id=' +
                  config.github.client_id +
                  '&client_secret=' +
                  config.github.client_secret,
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'User-Agent': 'Injectify'
                }
              },
              (error, response, user) => {
                try {
                  user = JSON.parse(user)
                } catch (e) {
                  console.log(
                    chalk.redBright('[websocket] ') +
                      chalk.yellowBright('failed to retrieve user API '),
                    user
                  )
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
              }
            )
          } else {
            request(
              {
                url:
                  'https://api.github.com/users/' +
                  encodeURIComponent(value) +
                  '?client_id=' +
                  config.github.client_id +
                  '&client_secret=' +
                  config.github.client_secret,
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  'User-Agent': 'Injectify'
                }
              },
              (error, response, user) => {
                try {
                  user = JSON.parse(user)
                } catch (e) {
                  console.log(
                    chalk.redBright('[websocket] ') +
                      chalk.yellowBright('failed to retrieve user API '),
                    user
                  )
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
              }
            )
          }
        })
      }
      var addToProject = (
        requestingUser,
        targetUser,
        choosenPermissionLevel,
        targetProject
      ) => {
        return new Promise((resolve, reject) => {
          if (
            targetProject.doc.permissions.owners.includes(targetUser) ||
            targetProject.doc.permissions.admins.includes(targetUser) ||
            targetProject.doc.permissions.readonly.includes(targetUser)
          ) {
            reject({
              title: 'User already exists',
              message: 'The selected user already exists in this project'
            })
          } else {
            if (choosenPermissionLevel === 'owners') {
              if (
                !targetProject.doc.permissions.owners.includes(
                  requestingUser.id
                )
              ) {
                reject({
                  title: 'Insufficient permissions',
                  message: "You don't have permission to add user"
                })
                return
              }
            } else if (choosenPermissionLevel === 'admins') {
              if (
                !targetProject.doc.permissions.owners.includes(
                  requestingUser.id
                )
              ) {
                reject({
                  title: 'Insufficient permissions',
                  message: "You don't have permission to add user"
                })
                return
              }
            } else if (choosenPermissionLevel === 'readonly') {
              if (
                !targetProject.doc.permissions.owners.includes(
                  requestingUser.id
                ) &&
                !targetProject.doc.permissions.admins.includes(
                  requestingUser.id
                )
              ) {
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
              projects.updateOne(
                {
                  name: targetProject.doc.name
                },
                {
                  $push: {
                    ['permissions.' + choosenPermissionLevel]: targetUser
                  }
                }
              )
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
          let theirPermissionLevel, theirPermissionName
          if (targetProject.doc.permissions.owners.includes(targetUser)) {
            theirPermissionLevel = 1
            theirPermissionName = 'permissions.owners'
          } else if (
            targetProject.doc.permissions.admins.includes(targetUser)
          ) {
            theirPermissionLevel = 2
            theirPermissionName = 'permissions.admins'
          } else if (
            targetProject.doc.permissions.readonly.includes(targetUser)
          ) {
            theirPermissionLevel = 3
            theirPermissionName = 'permissions.readonly'
          }
          if (
            targetProject.myPermissionLevel !== 3 &&
            targetProject.myPermissionLevel <= theirPermissionLevel
          ) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects.updateOne(
                {
                  name: targetProject.doc.name
                },
                {
                  $pull: {
                    [theirPermissionName]: targetUser
                  }
                }
              )
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
          if (
            targetProject.doc.permissions.owners.includes(requestingUser.id)
          ) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects
                .findOne({
                  name: newName
                })
                .then((doc) => {
                  if (doc == null) {
                    projects.updateOne(
                      {
                        name: targetProject.doc.name
                      },
                      {
                        $set: {
                          name: newName
                        }
                      }
                    )
                    resolve({
                      title: 'Renamed project',
                      message: 'Successfully renamed project to ' + newName
                    })
                  } else {
                    reject({
                      title: 'Failed to rename project',
                      message:
                        'The selected name ' + newName + ' is already taken'
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
          if (
            targetProject.doc.permissions.owners.includes(requestingUser.id) ||
            targetProject.doc.permissions.admins.includes(requestingUser.id)
          ) {
            db.collection('projects', (err, projects) => {
              if (err) throw err
              projects
                .findOne({
                  name: targetProject.doc.name
                })
                .then((doc) => {
                  if (doc !== null) {
                    projects.updateOne(
                      {
                        name: targetProject.doc.name
                      },
                      {
                        $set: {
                          'config.filter': newFilters
                        }
                      }
                    )
                    resolve({
                      title: 'Updated domain filters',
                      message:
                        'Successfully updated filters for ' +
                        targetProject.doc.name
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
              message:
                "You don't have permission to modify filters for this project"
            })
          }
        })
      }
      if (command && project) {
        getUser(globalToken)
          .then((user) => {
            getProject(project, user)
              .then((thisProject) => {
                if (command === 'permissions:add') {
                  if (data.project && data.method && data.type && data.value) {
                    convertToID(data.method, data.value)
                      .then((targetUser) => {
                        addToProject(
                          user,
                          targetUser.id,
                          data.type,
                          thisProject
                        )
                          .then((r) => {
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
                                chalk.cyanBright(
                                  ' (' + targetUser.login + ') '
                                ) +
                                chalk.yellowBright(' to project ') +
                                chalk.magentaBright(thisProject.doc.name)
                            )
                          })
                          .catch((e) => {
                            socket.emit('err', {
                              title: e.title,
                              message: e.message
                            })
                          })
                      })
                      .catch((e) => {
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
                    removeFromProject(user, data.user, thisProject)
                      .then((response) => {
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
                      })
                      .catch((e) => {
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
                    renameProject(user, thisProject, data.newName)
                      .then((response) => {
                        state.project = ''
                        state.page = ''
                        clearTimeout(state.refresh)
                        socket.emit('project:switch', {
                          project: data.newName
                        })
                        setTimeout(() => {
                          getProjects(user)
                            .then((projects) => {
                              socket.emit('user:projects', projects)
                            })
                            .catch((error) => {
                              if (config.debug)
                                console.log(
                                  chalk.redBright('[database] '),
                                  error
                                )
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
                      })
                      .catch((e) => {
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
                if (command === 'autoexecute') {
                  if (
                    data.project &&
                    typeof data.code === 'string' &&
                    thisProject.myPermissionLevel < 3
                  ) {
                    Update(data.project, {
                      $set: {
                        'config.autoexecute': data.code
                      }
                    })
                      .then(() => {
                        socket.emit('notify', {
                          title: 'Updated',
                          message: 'Successfully updated code'
                        })
                      })
                      .catch(() => {
                        socket.emit('err', {
                          title: 'Error',
                          message: 'Failed to update code'
                        })
                      })
                  } else {
                    socket.emit('err', {
                      title: 'Error',
                      message: 'Insufficient permissions'
                    })
                  }
                }
                if (command === 'filters:modify') {
                  if (data.project && data.filter) {
                    updateFilters(user, thisProject, data.filter)
                      .then((response) => {
                        socket.emit('notify', {
                          title: response.title,
                          message: response.message
                        })
                      })
                      .catch((e) => {
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
              })
              .catch((e) => {
                socket.emit('err', {
                  title: e.title,
                  message: e.message
                })
              })
          })
          .catch((e) => {
            socket.emit('err', {
              title: e.title,
              message: e.message
            })
          })
      }
    })

    socket.on('inject:clients', (data) => {
      let { project } = data
      if (project && globalToken) {
        getUser(globalToken)
          .then((user) => {
            getProject(project, user)
              .then((thisProject) => {
                if (watchers.inject) {
                  inject.watchers[watchers.inject] = inject.watchers[
                    watchers.inject
                  ].filter((watcher) => {
                    return watcher.id !== socket.id
                  })
                }
                watchers.inject = thisProject.doc['_id']
                if (!inject.watchers[watchers.inject])
                  inject.watchers[watchers.inject] = []
                inject.watchers[watchers.inject].push({
                  id: socket.id,
                  callback: (event, session) => {
                    socket.emit('inject:clients', {
                      event: event,
                      session: session,
                      project: project
                    })
                  }
                })
                socket.emit('inject:clients', {
                  event: 'list',
                  clients: inject.clients[thisProject.doc['_id']],
                  project: project
                })
              })
              .catch((e) => {
                console.log(e)
                socket.emit('err', {
                  title: e.title,
                  message: e.message
                })
              })
          })
          .catch((error) => {
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

    socket.on('inject:client', (data) => {
      let { project, client } = data
      if (
        typeof project === 'string' &&
        typeof client === 'string' &&
        globalToken
      ) {
        getUser(globalToken)
          .then((user) => {
            getProject(project, user)
              .then((thisProject) => {
                let clients = inject.clients[thisProject.doc['_id']]
                /**
                 * Remove previous watchers
                 */
                unwatch('client')
                if (clients && clients[client]) {
                  let watchingClient = clients[client]
                  if (!watchingClient.watchers) watchingClient.watchers = []
                  watchingClient.watchers.push({
                    socket: socket.id,
                    emit: (topic: string, data: any) => {
                      socket.emit(topic, data)
                    }
                  })

                  inject.clients[thisProject.doc['_id']][
                    client
                  ] = watchingClient
                  /**
                   * Overwrite watchers object
                   */
                  watchers.client = {
                    id: thisProject.doc['_id'],
                    token: client
                  }
                }
              })
              .catch((e) => {
                console.log(e)
                socket.emit('err', {
                  title: e.title,
                  message: e.message
                })
              })
          })
          .catch((error) => {
            // Failed to authenticate user with token
            console.log(chalk.redBright('[inject:client] '), error.message)
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

    socket.on('inject:execute', (data) => {
      let { project, token, id, script, scroll, recursive } = data
      if (
        project &&
        (recursive ||
          (typeof token === 'string' &&
            (typeof id === 'string' || typeof id === 'undefined'))) &&
        (typeof script === 'string' || scroll) &&
        globalToken
      ) {
        getUser(globalToken)
          .then((user) => {
            getProject(project, user)
              .then((thisProject) => {
                if (inject.clients[thisProject.doc['_id']]) {
                  if (recursive) {
                    Object.keys(inject.clients[thisProject.doc['_id']]).forEach(
                      (token) => {
                        if (
                          inject.clients[thisProject.doc['_id']][token] &&
                          inject.clients[thisProject.doc['_id']][token].sessions
                        ) {
                          inject.clients[thisProject.doc['_id']][
                            token
                          ].sessions.forEach((client) => {
                            if (scroll) {
                              client.scroll(script)
                            } else {
                              client.execute(script)
                            }
                          })
                        }
                      }
                    )
                  } else if (typeof id === 'undefined') {
                    if (
                      inject.clients[thisProject.doc['_id']][token] &&
                      inject.clients[thisProject.doc['_id']][token].sessions
                    ) {
                      inject.clients[thisProject.doc['_id']][
                        token
                      ].sessions.forEach((client) => {
                        if (client) {
                          if (scroll) {
                            client.scroll(script)
                          } else {
                            client.execute(script)
                          }
                        }
                      })
                    } else {
                      socket.emit('err', {
                        title: 'Failed to execute!',
                        message: 'Could not locate client'
                      })
                    }
                  } else {
                    if (
                      inject.clients[thisProject.doc['_id']][token] &&
                      inject.clients[thisProject.doc['_id']][token].sessions
                    ) {
                      let client = inject.clients[thisProject.doc['_id']][
                        token
                      ].sessions.find((c) => c.id === id)
                      if (client) {
                        if (scroll) {
                          client.scroll(script)
                        } else {
                          client.execute(script)
                        }
                      } else {
                        socket.emit('err', {
                          title: 'Failed to execute!',
                          message: 'Could not locate client'
                        })
                      }
                    } else {
                      socket.emit('err', {
                        title: 'Failed to execute!',
                        message: 'Could not locate client'
                      })
                    }
                  }
                } else {
                  socket.emit('err', {
                    title: 'Failed to execute!',
                    message: 'Could not locate clients for project'
                  })
                }
              })
              .catch((e) => {
                console.log(e)
                socket.emit('err', {
                  title: e.title,
                  message: e.message
                })
              })
          })
          .catch((error) => {
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

    socket.on('project:close', (data) => {
      state.project = ''
      state.page = ''
      clearTimeout(state.refresh)
      unwatch('client')
    })

    socket.on('inject:close', (data) => {
      unwatch('inject')
      unwatch('client')
    })

    socket.on('disconnect', (data) => {
      unwatch('inject')
      unwatch('client')
      state = {}
    })
  })

  // Express middleware
  app.use(cookieParser())
  app.use(pretty({ query: 'pretty' }))

  /**
   * Inject authorisation API
   */
  app.get('/a', injectLimiter, (req, res) => {
    let generateToken = (req) => {
      let ip
      try {
        ip = req.headers['x-forwarded-for'].split(',')[0]
      } catch (e) {
        ip = getIP(req.connection.remoteAddress)
      }
      return btoa(
        JSON.stringify({
          ip: ip,
          id: +new Date()
        })
      )
    }
    let authenticate = (req, res, token) => {
      let { id } = req.query
      try {
        let { ip } = JSON.parse(atob(token))
        if (ip) {
          /**
           * Correctly parsed token
           */
          let realIP
          try {
            realIP = req.headers['x-forwarded-for'].split(',')[0]
          } catch (e) {
            realIP = getIP(req.connection.remoteAddress)
          }
          if (realIP !== ip) {
            /**
             * Token validation failed, either forged or users IP changed
             */
            token = generateToken(req)
            res.cookie('token', token)
          }
          /**
           * Token validation complete, time to add them to the project
           */
          if (inject.authenticate[id]) {
            inject.authenticate[id](token, req)
            delete inject.authenticate[id]
          } else {
            if (config.verbose) {
              console.log(
                chalk.redBright('[inject:auth] ') +
                  chalk.yellowBright(
                    `failed to authenticate client, failed to locate inject.authenticate["${id}"]`
                  )
              )
            }
          }
        }
      } catch (e) {
        //
      }
    }
    if (req.query) {
      /**
       * Authentication
       */
      if (req.query.id) {
        /**
         * Client wants to directly authenticate with token
         */
        if (req.query.token) {
          authenticate(req, res, req.query.token)
        } else {
          if (req.cookies && req.cookies.token) {
            /**
             * Authenticate with user specified token
             */
            authenticate(req, res, req.cookies.token)
          } else {
            /**
             * Generate a new token
             */
            let token = generateToken(req)
            res.cookie('token', token)
            authenticate(req, res, token)
          }
          //
          res.send(req.cookies)
        }
      } else {
        if (config.verbose) {
          console.log(
            chalk.redBright('[inject:auth] ') +
              chalk.yellowBright(
                'failed to authenticate client, missing ID in query'
              )
          )
        }
      }
    } else {
      if (config.verbose) {
        console.log(
          chalk.redBright('[inject:auth] ') +
            chalk.yellowBright(
              'failed to authenticate client, missing URL query'
            )
        )
      }
    }
  })

  /**
   * APIs
   */
  app.use('/api', apiLimiter, api.graphql())

  if (config.dev) {
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
      request(
        'http://localhost:8080' + req.originalUrl.substring(9),
        (error, response) => {
          if (error) throw error
          if (response.statusCode === 404) {
            request('http://localhost:8080/').pipe(res)
          } else {
            request(
              'http://localhost:8080' + req.originalUrl.substring(9)
            ).pipe(res)
          }
        }
      )
    })
    app.use('/*', (req, res) => {
      if (req.url.substr(0, 9) === '/cdn-cgi/') return
      if (/^\/settings|\/documentation$/.test(req.originalUrl))
        req.originalUrl = '/'
      request('http://localhost:8080' + req.originalUrl).pipe(res)
    })
  } else {
    app.use('/projects/*', (req, res) => {
      if (req.originalUrl.includes('/vs/')) {
        let vs = req.originalUrl.split('/vs/')
        vs = '../interface/public/vs/' + path.normalize(vs[vs.length - 1])
        if (fs.existsSync(path.join(__dirname, vs))) {
          res.sendFile(path.join(__dirname, vs))
        } else {
          res.status(404).send('Not found')
        }
      } else {
        res.sendFile(path.join(__dirname, '../interface/public/index.html'))
      }
    })
    app.get(['/settings', '/documentation'], (req, res) => {
      res.sendFile(path.join(__dirname, '../interface/public/index.html'))
    })
    app.use(express.static(path.join(__dirname, '../interface/public')))
  }

  /**
   * LocalTunnel
   */
  if (config.localtunnel && config.localtunnel.enable) new LocalTunnel()
})
