// @ts-check

const winston = require('winston')

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
