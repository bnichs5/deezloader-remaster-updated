// @ts-check

const logger = require('./logger')
const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const packageJson = require('../package.json')
const defaultConfigLocation = path.join(__dirname, '..', 'default.json')
const defaultConfig = fs.readJSONSync(defaultConfigLocation)
let userdata = ''
let homedata = os.homedir()
let logsLocation = ''
let configFileLocation = ''
let configFile = undefined
let autologinLocation = ''
let defaultDownloadDir = ''
let coverArtFolder = ''

const loadDefaultConfig = () => {
  fs.outputJSONSync(configFileLocation, defaultConfig, {
    spaces: '  '
  })
}

const saveConfig = () => {
  fs.outputJSONSync(configFileLocation, configFile, {
    spaces: '  '
  })
  logger.info('Settings updated.')
}

switch (process.platform) {
  case 'win32':
    userdata = path.join(process.env.APPDATA, 'Deezloader')
    break
  case 'darwin':
    userdata = path.join(homedata, 'Library', 'Application Support', 'Deezloader')
    break
  case 'android':
    homedata = path.join(homedata, 'storage', 'shared')
    userdata = path.join(homedata, 'Deezloader')
    break
  default:
    userdata = path.join(homedata, '.config', 'Deezloader')
    break
}

configFileLocation = path.join(userdata, 'config.json')
if (!fs.existsSync(configFileLocation)) {
  loadDefaultConfig()
}
configFile = fs.readJSONSync(configFileLocation)
autologinLocation = path.join(userdata, 'autologin')
defaultDownloadDir = path.join(homedata, 'Music', 'Deezloader')
coverArtFolder = path.join(os.tmpdir(), 'deezloader-imgs')
logsLocation = path.join(userdata, 'logs.log')

const configIsOk = () => {
  if (typeof configFile.userDefined.numplaylistbyalbum != "boolean") {
    logger.warn('numplaylistbyalbum is not a boolean in configuration. ' +
      `Current value: ${configFile.userDefined.numplaylistbyalbum}`, {})
    return false
  }
  if (typeof configFile.userDefined.syncedlyrics != "boolean") {
    logger.warn('syncedlyrics is not a boolean in configuration. ' +
      `Current value: ${configFile.userDefined.syncedlyrics}`, {})
    return false
  }
  if (typeof configFile.userDefined.padtrck != "boolean") {
    logger.warn('padtrck is not a boolean in configuration. ' +
      `Current value: ${configFile.userDefined.padtrck}`, {})
    return false
  }
  if (typeof configFile.userDefined.albumNameTemplate != "string") {
    logger.warn('albumNameTemplate is not a boolean in configuration. ' +
      `Current value: ${configFile.userDefined.albumNameTemplate}`, {})
    return false
  }
  if (!configFile.opens) {
    logger.warn(`opens is not a number. Current value ${configFile.opens}`)
    return false
  }
  return true
}

if (!configIsOk()) {
  logger.info('Some configuration was wrong. Setting configuration to defaults.')
  loadDefaultConfig()
  configFile = fs.readJSONSync(configFileLocation)
}

module.exports = {
  userdata,
  logsLocation,
  configFile,
  autologinLocation,
  coverArtFolder,
  packageJson,
  saveConfig,
}
