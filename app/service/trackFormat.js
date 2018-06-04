/**
 * @param {number} number
 * @return {boolean}
 */
const isFLAC = (number) => {
  return number === 9
}

/**
 * @param {number} number
 * @return {boolean}
 */
const isMP3 = (number) => {
  return number !== 9
}

module.exports = { isFLAC, isMP3 }
