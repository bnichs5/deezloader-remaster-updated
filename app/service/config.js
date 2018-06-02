// @ts-check

const logger = require('./logger')
const path = require('path')
const fs = require('fs-extra')
const paths = require('../utils/paths')

let configFile = {}
let downloadDir = ''

const resetTmpDir = () => {
  fs.removeSync(paths.tmp);
  fs.ensureDirSync(paths.tmp);
}

const loadDefaultConfig = () => {
  const defaultConfig = fs.readJSONSync(paths.defaultConfig)
  defaultConfig.userDefined.downloadLocation = paths.defaultDownload
  fs.outputJSONSync(paths.config, defaultConfig, {
    spaces: '  '
  })
}

const ensureDownloadDir = () => {
  if (!fs.existsSync(configFile.userDefined.downloadLocation)) {
    configFile.userDefined.downloadLocation = paths.defaultDownload
  }
}

const saveConfig = () => {
  fs.outputJSONSync(paths.config, configFile, {
    spaces: '  '
  })
  downloadDir = getDownloadDir()
  logger.info('Settings saved.')
}

let settings = {
  opens: {
    increment: () => {
      configFile.opens++
      saveConfig()
    },
    read: () => configFile.opens
  },
  serverPort: () => configFile.serverPort,
}

const userSettings = {
  update: (newSettings) => {
    configFile.userDefined = newSettings
    ensureDownloadDir()
    downloadDir = getDownloadDir()
    saveConfig()
    logger.info('User settings updated.')
  },
  read: () => configFile.userDefined,
}

const getDownloadDir = () => {
  ensureDownloadDir()
  return configFile.userDefined.downloadLocation
}

const configIsOk = () => {
  if (!fs.existsSync(paths.config)) {
    loadDefaultConfig()
  }
  configFile = fs.readJSONSync(paths.config)
  const errors = []
  const user = configFile.userDefined
  if (typeof user.numplaylistbyalbum != 'boolean') {
    errors.push({key: 'numplaylistbyalbum', type: 'boolean'})
  }
  if (typeof user.syncedlyrics != 'boolean') {
    errors.push({key: 'syncedlyrics', type: 'boolean'})
  }
  if (typeof user.padtrck != 'boolean') {
    errors.push({key: 'padtrck', type: 'boolean'})
  }
  if (typeof user.albumNameTemplate != 'string') {
    errors.push({key: 'albumNameTemplate', type: 'string'})
  }
  if (typeof configFile.opens != 'number') {
    logger.warn(`opens is not a number. Current value ${configFile.opens}`)
    errors.push({key: 'opens', type: 'number'})
  }
  if (errors.length === 0) {
    return true
  }
  errors.forEach(e => {
    logger.warn(`${e.key} is not a ${e.type}.`)
  })
}

if (!configIsOk()) {
  logger.info('Some configuration was wrong. Setting configuration to defaults.')
  loadDefaultConfig()
  configFile = fs.readJSONSync(paths.config)
}

resetTmpDir()

module.exports = {
  userSettings,
  settings,
}
