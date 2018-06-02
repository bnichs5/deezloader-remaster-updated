const { settings } = require('./config')

const shouldOpen = () => {
  settings.opens.increment()
  if (settings.opens.read() === 3) {
    return true
  }
  if (settings.opens.read() % 10 == 0) {
    return true
  }
  return false
}

module.exports = { shouldOpen }
