// @ts-check

const logger = require('./logger')
const os = require('os')
const path = require('path')
const fs = require('fs-extra')

const packageJson = require('../package.json')
const defaultConfigPath = path.join(__dirname, '..', 'default.json')
const defaultConfig = fs.readJSONSync(defaultConfigPath)
let userdata = ''
let homedata = os.homedir()
let configFilePath = ''
let configFile = {}
let autoLoginPath = ''
let defaultDownloadDir = ''
let downloadDir = ''
let coverArtFolder = ''

const loadDefaultConfig = () => {
  fs.outputJSONSync(configFilePath, defaultConfig, {
    spaces: '  '
  })
}
let settings = {
  save: () => {
    fs.outputJSONSync(configFilePath, configFile, {
      spaces: '  '
    })
    downloadDir = getDownloadDir()
    logger.info('Settings saved.')
  },
  update: (newUserSettings) => {
    let userSettings = newUserSettings
    if (userSettings.downloadLocation == defaultDownloadDir) {
      userSettings.downloadLocation = null;
    } else {
      userSettings.downloadLocation =
        path.resolve(userSettings.downloadLocation + path.sep) + path.sep;
      downloadDir = userSettings.downloadLocation;
    }
    configFile.userDefined = userSettings
    downloadDir = getDownloadDir()
    settings.save()
    logger.info('Settings updated.')
  },
  incrementOpens: () => {
    configFile.opens++
    settings.save()
  },
  shouldOpen: () => {
    if (configFile.opens === 3) {
      return true
    }
    if (configFile.opens % 10 == 0) {
      return true
    }
    return false
  },
  user: () => {
    return configFile.userDefined
  },
  serverPort: () => {
    return configFile.serverPort
  },
  opens: () => {
    return configFile.opens
  },
}

const autoLogin = {
  save: (data) => {
    fs.outputFileSync(autoLoginPath, data)
    logger.info('Autologin saved.')
  },
  load: () => {
    if (!fs.existsSync(autoLoginPath)) {
      logger.info('Autologin not found.')
      return ''
    }
    let data = fs.readFileSync(autoLoginPath).toString('utf8')
    logger.info('Loaded auto login.')
    return data
  },
  delete: () => {
    fs.unlink(autoLoginPath, function () {})
  }
}

const coverArt = {
  reset: () => {
    fs.removeSync(coverArtFolder);
    fs.ensureDirSync(coverArtFolder);
  },
  path: () => {
    return coverArtFolder
  }
}

const getDownloadDir = () => {
  let dir = defaultDownloadDir
  if (configFile.userDefined.downloadLocation != null) {
    dir = configFile.userDefined.downloadLocation
  }
  if (!fs.existsSync(dir)) {
    dir = defaultDownloadDir;
    configFile.userDefined.downloadLocation = dir
    fs.ensureDirSync(dir)
    settings.save()
  }
  return dir
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

configFilePath = path.join(userdata, 'config.json')
if (!fs.existsSync(configFilePath)) {
  loadDefaultConfig()
}
configFile = fs.readJSONSync(configFilePath)
autoLoginPath = path.join(userdata, 'autologin')
defaultDownloadDir = path.join(homedata, 'Music', 'Deezloader')
downloadDir = getDownloadDir()
coverArtFolder = path.join(os.tmpdir(), 'deezloader-imgs')

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
  if (typeof configFile.opens != "number") {
    logger.warn(`opens is not a number. Current value ${configFile.opens}`)
    return false
  }
  return true
}

if (!configIsOk()) {
  logger.info('Some configuration was wrong. Setting configuration to defaults.')
  loadDefaultConfig()
  configFile = fs.readJSONSync(configFilePath)
}

coverArt.reset()

module.exports = {
  settings,
  autoLogin,
  coverArt,
  packageJson,
  downloadDir,
  userdata,
}
