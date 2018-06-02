const express = require('express')
const app = express()
const http = require('http')
const socketIO = require('socket.io')
const logger = require('./service/logger')
const { settings } = require('./service/config')

const server = http.createServer(app)
const io = socketIO.listen(server, {log: false})

// Route and Create server
app.use('/', express.static(__dirname + '/public/'))
server.listen(settings.serverPort())
logger.info(`Server is running @ localhost: ${settings.serverPort()}`)

logger.info('Waiting for socket to connect.')

module.exports = {
  onConnection: (callback) => {
    io.sockets.on('connection', (socket) => {
      logger.info('Socket connected.')
      callback(socket)
    })
  }
}
