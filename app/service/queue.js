let timer
const interval = 100
let maxItems = 10
let ms = 1000
let queueExecuting = []
let queueWaiting = []
let executing = 0

const startTimer = () => {
  return setInterval(() => {
    while (shouldExecute()) {
      execute()
    }
  }, interval)
}

const shouldExecute = () => {
  if (queueWaiting.length === 0) return false
  if (executing >= maxItems) return false
  return true
}

const execute = async () => {
  const asyncFunc = queueWaiting.shift()
  queueExecuting.push(asyncFunc)
  executing++
  asyncFunc()
    .then(() => finishExecution(asyncFunc))
    .catch(() => finishExecution(asyncFunc))
}

const finishExecution = (asyncFunc) => {
  queueExecuting.shift()
  setTimeout(() => {
    console.log('Position liberated')
    executing--
    if (executing === 0 && queueWaiting.length === 0 && queueExecuting.length === 0)  {
      clearInterval(timer)
      timer = undefined
    }
  }, ms)
}

/**
 *
 * @param {function[]} asyncFunc
 * @return {Promise}
 */
const add = async (...asyncFunc) => {
  if (!timer) timer = startTimer()
  queueWaiting.push(...asyncFunc)
}

/**
 *
 * @param {object} options
 * @param {number} [options.maxItems] Number of items to execute in the designed time. Default 10.
 * @param {number} [options.ms] Limit of time for execute the items. Default 1000.
 */
const configure = (options) => {
  options = options || {}
  if (options.maxItems) maxItems = options.maxItems
  if (options.ms) ms = options.ms
  return deezerQueue
}

const queue = { add, configure }

module.exports = queue
