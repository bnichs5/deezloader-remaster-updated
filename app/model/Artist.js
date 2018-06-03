const url = require('url')

class Artist {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.name]
   * @param {string} [options.link]
   * @param {string} [options.share]
   * @param {string} [options.picture]
   * @param {string} [options.picture_small]
   * @param {string} [options.picture_medium]
   * @param {string} [options.picture_big]
   * @param {string} [options.picture_xl]
   * @param {number} [options.nb_album]
   * @param {number} [options.nb_fan]
   * @param {boolean} [options.radio]
   * @param {string} [options.tracklist]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.name = opt.name
    this.link = new url.URL(opt.link)
    this.share = new url.URL(opt.share)
    this.picture = new url.URL(opt.picture)
    this.picture_small = new url.URL(opt.picture_small)
    this.picture_medium = new url.URL(opt.picture_medium)
    this.picture_big = new url.URL(opt.picture_big)
    this.picture_xl = new url.URL(opt.picture_xl)
    this.nb_album = opt.nb_album
    this.nb_fan = opt.nb_fan
    this.radio = opt.radio
    this.tracklist = new url.URL(opt.tracklist)
  }

  /**
   * @return {string}
   */
  toJSON() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      link: this.link.toJSON(),
      share: this.share.toJSON(),
      picture: this.picture.toJSON(),
      picture_small: this.picture_small.toJSON(),
      picture_medium: this.picture_medium.toJSON(),
      picture_big: this.picture_big.toJSON(),
      picture_xl: this.picture_xl.toJSON(),
      nb_album: this.nb_album,
      nb_fan: this.nb_fan,
      radio: this.radio,
      tracklist: this.tracklist.toJSON(),
    })
  }
}

module.exports = Artist
