const request = require('request')
const moment = require('moment')
const fs = require('fs')
const getos = require('getos')
const chalk = require('chalk')

/**
 * Get the webhook URL from Travis
 */
let webhook = process.env.webhook

/**
 * Attempt to get the webhook from the server.config.js
 */
if (!webhook) {
  let config
  if (fs.existsSync('../server.config.js')) {
    config = require('../server.config.js').injectify
  } else {
    config = require('../server.config.example.js').injectify
  }
  if (config && config.discord && config.discord.webhook) {
    webhook = config.discord.webhook
  }
}
if (webhook) {
  /**
   * Get status type
   */
  let status = process.argv.slice(2)[0] && process.argv.slice(2)[0].toLowerCase()
  let event
  let state
  let message

  /**
   * Parse the parameter
   */
  if (status && status.split('-').length === 2) {
    event = status.split('-')
    event = {
      platform: event[0],
      type: event[1]
    }
    if (
      !(
        event.platform == 'ci' ||
        event.platform == 'deploy'
      ) || !(
        event.type == 'start' ||
        event.type == 'success' ||
        event.type == 'failure'
      )
    ) {
      console.log(`${chalk.redBright('Failed to send message!')} ${chalk.magentaBright(status)} ${chalk.redBright('is an invalid state!')}`)
      process.exit()
    }
  } else {
    console.log(`${chalk.redBright('Failed to send message!')} ${chalk.magentaBright(status)} ${chalk.redBright('is an invalid state!')}`)
    process.exit()
  }
  
  /**
   * Continuous integration
   */
  if (event.platform === 'ci') {
    /**
     * CircleCI
     */
    message = {
      url: `https://circleci.com/gh/${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}/${process.env.CIRCLE_BUILD_NUM}`,
      number: process.env.CIRCLE_BUILD_NUM,
      footer: `${process.env.CIRCLE_PROJECT_USERNAME}/${process.env.CIRCLE_PROJECT_REPONAME}:${process.env.CIRCLE_BRANCH} | #${process.env.CIRCLE_SHA1 && process.env.CIRCLE_SHA1.substr(0, 7)}`,
      icons: {
        start: 'https://assets.brandfolder.com/otz5r1-31h1bc-226m59/v/803151/view.png',
        success: 'https://assets.brandfolder.com/otz5r1-31h1bc-226m59/v/803151/view.png',
        failure: 'https://assets.brandfolder.com/otz5r1-31h1bc-226m59/v/803151/view.png'
      }
    }

    /**
     * TravisCI
     */
    if (process.env.TRAVIS_REPO_SLUG)
      message = {
        url: `https://travis-ci.org/${process.env.TRAVIS_REPO_SLUG || 'samdenty99/injectify'}/builds/${process.env.TRAVIS_BUILD_ID}`,
        number: process.env.TRAVIS_BUILD_NUMBER,
        footer: `${process.env.TRAVIS_REPO_SLUG}:${process.env.TRAVIS_BRANCH || 'master'} | #${process.env.TRAVIS_COMMIT && process.env.TRAVIS_COMMIT.substr(0, 7)}`,
        icons: {
          start: 'https://travis-ci.com/images/logos/TravisCI-Mascot-grey.png',
          success: 'https://travis-ci.com/images/logos/TravisCI-Mascot-1.png',
          failure: 'https://travis-ci.com/images/logos/TravisCI-Mascot-red.png'
        }
      }

    /**
     * Set state
     */
    if (event.type === 'start')
      state = {
        color: 16770600,
        icon: message.icons.start,
        message: 'Starting build ⏳'
      }

    if (event.type === 'success')
      state = {
        color: 5025616,
        icon: message.icons.success,
        message: 'Build passed ✅'
      }

    if (event.type === 'failure')
      state = {
        color: 16007990,
        icon: message.icons.failure,
        message: 'Build failed! ❌'
      }
    /**
     * Send message
     */
    send()
  }

  /**
   * Deployment scripts
   */
  if (event.platform === 'deploy') {
    message = {
      footer: `Injectify server`,
      icons: {
        start: 'https://rawgit.com/samdenty99/injectify/master/assets/sizes/transparent_white.png',
        success: 'https://rawgit.com/samdenty99/injectify/master/assets/sizes/transparent_white.png',
        failure: 'https://rawgit.com/samdenty99/injectify/master/assets/sizes/transparent_white.png'
      }
    }
    /**
     * Set state
     */
    if (event.type === 'start')
      state = {
        color: 16770600,
        icon: message.icons.start,
        message: 'Deploying 🌐',
        description: ''
      }

    if (event.type === 'success')
      state = {
        color: 5025616,
        icon: message.icons.success,
        message: 'Deployed! ✳️',
        description: ''
      }

    if (event.type === 'failure')
      state = {
        color: 16007990,
        icon: message.icons.failure,
        message: 'Failed to deploy! SERVER OFFLINE 🛑',
        description: ''
      }
    
    getos((error, os) => {
      if (error) {
        console.log(error)
      } else {
        if (os.os === 'win32')
          os = `Windows ${require('os').release()}`
        else
          os = `${os.dist} ${os.release}`

        message.footer = `Injectify server | ${os}`
      }
      send()
    })
  }

  function send() {
    request({
      url: webhook,
      method: 'POST',
      json: true,
      body: {
        username: 'Injectify',
        avatar_url: 'https://rawgit.com/samdenty99/injectify/master/assets/discord/avatar.png',
        embeds: [
          {
            author:{
              name: state.message,
              url: message.url,
              icon_url: state.icon
            },
            description: typeof state.description !== 'undefined' ? state.description : `[Log for #${message.number}](${message.url})`,
            color: state.color,
            footer: {  
              text: message.footer
            },
            timestamp: moment().format()
          }
        ]
      }
    }, error => {
      if (error) {
        console.error(chalk.redBright('Failed to send message on discord using the webhook ') + chalk.magentaBright(webhook), error)
      } else {
        console.log(chalk.greenBright('Sent message on discord'))
      }
    })
  }
}