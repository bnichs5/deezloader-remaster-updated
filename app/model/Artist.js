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
    this.link = opt.link ? new url.URL(opt.link) : null
    this.share = opt.share ? new url.URL(opt.share) : null
    this.picture = opt.picture ? new url.URL(opt.picture) : null
    this.picture_small = opt.picture_small ? new url.URL(opt.picture_small) : null
    this.picture_medium = opt.picture_medium ? new url.URL(opt.picture_medium) : null
    this.picture_big = opt.picture_big ? new url.URL(opt.picture_big) : null
    this.picture_xl = opt.picture_xl ? new url.URL(opt.picture_xl) : null
    this.nb_album = opt.nb_album
    this.nb_fan = opt.nb_fan
    this.radio = opt.radio
    this.tracklist = opt.tracklist ? new url.URL(opt.tracklist) : null
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      link: this.link ? this.link.toJSON() : null,
      share: this.share ? this.share.toJSON() : null,
      picture: this.picture ? this.picture.toJSON() : null,
      picture_small: this.picture_small ? this.picture_small.toJSON() : null,
      picture_medium: this.picture_medium ? this.picture_medium.toJSON() : null,
      picture_big: this.picture_big ? this.picture_big.toJSON() : null,
      picture_xl: this.picture_xl ? this.picture_xl.toJSON() : null,
      nb_album: this.nb_album,
      nb_fan: this.nb_fan,
      radio: this.radio,
      tracklist: this.tracklist ? this.tracklist.toJSON() : null,
    }
  }

  static URL() {
    return new url.URL('https://api.deezer.com/artist/')
  }

  static generateURL(id) {
    return `${Artist.URL().toString()}/${id}`
  }
}

module.exports = Artist
