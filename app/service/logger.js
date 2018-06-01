// @ts-check

const winston = require('winston')
const path = require('path')
const { userdata } = require('./config')
// console.log(userdata)
// const filePath  = path.join(userdata, 'logs.log')

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      colorize: true,
      timestamp: true,
      json: false,
    })
  ],
  level: 'silly',
})

module.exports = logger
