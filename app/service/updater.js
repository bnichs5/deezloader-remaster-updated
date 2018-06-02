const logger = require('./logger')
const currentVersion = require('../package.json').version
const request = require('requestretry').defaults({
  maxAttempts: 3,
  retryDelay: 500,
  timeout: 5000
})

const check = () => {
  let status = {
    updated: true,
    latestVersion: currentVersion,
    link: '',
  }
  return new Promise((resolve, reject) => {
    request.get("https://pastebin.com/raw/BRZTQGkM", function (error, response, body) {
      if (error || response.statusCode != 200) {
        return reject(error)
      }
      body = body.replace('\r', '')
      status.latestVersion = body.split('\n')[0]
      if (status.latestVersion === currentVersion) {
        logger.info(`You have the latest version: ${status.latestVersion}.`)
      } else {
        status.updated = false
        status.link = body.split('\n')[1]
        logger.info(`Outdated version. The latest one is: ${status.latestVersion}.`)
      }
      return resolve(status)
    })
  })
}

module.exports = { check }
