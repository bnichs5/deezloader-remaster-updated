const url = require('url')

class Genre {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.name]
   * @param {string} [options.picture]
   * @param {string} [options.picture_small]
   * @param {string} [options.picture_medium]
   * @param {string} [options.picture_big]
   * @param {string} [options.picture_xl]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.name = opt.name
    this.picture = new url.URL(opt.picture)
    this.picture_small = new url.URL(opt.picture_small)
    this.picture_medium = new url.URL(opt.picture_medium)
    this.picture_big = new url.URL(opt.picture_big)
    this.picture_xl = new url.URL(opt.picture_xl)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      picture: this.picture.toJSON(),
      picture_small: this.picture_small.toJSON(),
      picture_medium: this.picture_medium.toJSON(),
      picture_big: this.picture_big.toJSON(),
      picture_xl: this.picture_xl.toJSON(),
    }
  }
}

module.exports = Genre
