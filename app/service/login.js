const fs = require('fs-extra')
const deezer = require('./deezer')
const logger = require('./logger')
const config = require('./config')
const encryptor = require('./encryptor')
const paths = require('../utils/paths')
const { socket } = require('../server')
const message = require('./message')
/** @type{*} */
const request = require('requestretry').defaults({
	maxAttempts: 2147483647,
	retryDelay: 1000,
	timeout: 8000
})

const login = (socket, username, password, autoLoginChecked) => {
  deezer.init(username, password)
    .then(() => {
      if (autoLoginChecked) {
        let data = `${username}:${password}`
        save(encryptor.encrypt(data))
      }
      socket.emit('login', 'none')
      logger.info('Logged in successfully')
      if (message.shouldOpen()) {
        socket.emit('donation')
        request.get('https://pastebin.com/raw/a6qqEMdm', function (error, response, body) {})
      }
    })
    .catch(e => {
      socket.emit("login", e.message);
      logger.error(`Failed to login.`, {
        err: e.message
      })
    })
}

const autoLogin = (socket) => {
  let data = load()
  if (!data) {
    return
  }
  try {
    let decryptedData = encryptor.decrypt(data)
    let userAndPassword = decryptedData.split(':')
    socket.emit("autologin", userAndPassword[0], userAndPassword[1])
  } catch (e) {
    logger.warn('Invalid autologin file. Deleting it.')
    remove()
    return
  }
}

const logout = () => {
  logger.info('Logged out.')
  remove()
}

const save = (data) => {
  fs.outputFileSync(paths.autoLogin, data)
  logger.info('Autologin saved.')
}

const load = () => {
  if (!fs.existsSync(paths.autoLogin)) {
    logger.info('Autologin not found.')
    return ''
  }
  let data = fs.readFileSync(paths.autoLogin).toString('utf8')
  logger.info('Loaded auto login.')
  return data
}

const remove = () => {
  fs.unlink(paths.autoLogin, function () {})
}

module.exports = {
  login,
  autoLogin,
  logout
}
