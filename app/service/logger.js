// @ts-check

const winston = require('winston')
const path = require('path')
const util = require('util')
const logPath = require('../utils/paths').log

const consoleTransport = new winston.transports.Console({
  colorize: true,
  timestamp: true,
  json: false,
  prettyPrint: true,
})

const fileTransport = new winston.transports.File({
  filename: logPath,
  timestamp: true,
  json: false,
  prettyPrint: true,
})

const logger = {
  development: new winston.Logger({
    transports: [ consoleTransport, fileTransport ],
    level: 'silly',
  }),
  production: new winston.Logger({
    transports: [ fileTransport ],
    level: 'info',
  })
}

if (process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'production'
}

logger[process.env.NODE_ENV].info(`Running logger on ${process.env.NODE_ENV} mode.`)

module.exports = logger[process.env.NODE_ENV]
