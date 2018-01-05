const request = require('request')
const moment = require('moment')
const fs = require('fs')
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
   * CircleCI
   */
  let ci = {
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
  if (process.env.TRAVIS_REPO_SLUG) {
    ci = {
      url: `https://travis-ci.org/${process.env.TRAVIS_REPO_SLUG || 'samdenty99/injectify'}/builds/${process.env.TRAVIS_BUILD_ID}`,
      number: process.env.TRAVIS_BUILD_NUMBER,
      footer: `${process.env.TRAVIS_REPO_SLUG}:${process.env.TRAVIS_BRANCH || 'master'} | Job ID ${process.env.TRAVIS_JOB_ID}`,
      icons: {
        start: 'https://travis-ci.com/images/logos/TravisCI-Mascot-grey.png',
        success: 'https://travis-ci.com/images/logos/TravisCI-Mascot-1.png',
        failure: 'https://travis-ci.com/images/logos/TravisCI-Mascot-red.png'
      }
    }
  }

  /**
   * Set state
   */
  let state = {
    color: 16770600,
    icon: ci.icons.start,
    message: 'Starting build ⏳'
  }
  /**
   * Success & failure states
   */
  if (status === 'success') {
    state = {
      color: 5025616,
      icon: ci.icons.success,
      message: 'Build passed ✅'
    }
  } else if (status === 'failure') {
    state = {
      color: 16007990,
      icon: ci.icons.failure,
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
            url: ci.url,
            icon_url: state.icon
          },
          description: `[Log for #${ci.number}](${ci.url})`,
          color: state.color,
          footer: {  
            text: ci.footer
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