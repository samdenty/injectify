const request = require('request')
const moment = require('moment')
const fs = require('fs')
const deploy = require('./deploy')
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
  /**
   * Default to start if invalid / not specified
   */
  if (status !== 'start' && status !== 'success' && status !== 'failure') status = 'start'

  /**
   * Set state
   */
  let state = {
    color: 16770600,
    mascot: 'https://travis-ci.com/images/logos/TravisCI-Mascot-grey.png',
    message: 'Starting build ⏳'
  }
  /**
   * Success & failure states
   */
  if (status === 'success') {
    state = {
      color: 5025616,
      mascot: 'https://travis-ci.com/images/logos/TravisCI-Mascot-1.png',
      message: 'Build passed ✅'
    }
  } else if (status === 'failure') {
    state = {
      color: 16007990,
      mascot: 'https://travis-ci.com/images/logos/TravisCI-Mascot-red.png',
      message: 'Build failed! ❌'
    }
  }

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
            url: `https://travis-ci.org/${process.env.TRAVIS_REPO_SLUG}/builds/${process.env.TRAVIS_BUILD_ID}`,
            icon_url: state.mascot
          },
          description: `[Log for #${process.env.TRAVIS_BUILD_NUMBER}](https://travis-ci.org/${process.env.TRAVIS_REPO_SLUG}/builds/${process.env.TRAVIS_BUILD_ID})`,
          color: state.color,
          footer: {  
            text: `Job ID ${process.env.TRAVIS_JOB_ID}`
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
  if (status === 'success') {
    deploy()
  }
}