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
    this.link = opt.link
    this.share = opt.share
    this.picture = opt.picture
    this.picture_small = opt.picture_small
    this.picture_medium = opt.picture_medium
    this.picture_big = opt.picture_big
    this.picture_xl = opt.picture_xl
    this.nb_album = opt.nb_album
    this.nb_fan = opt.nb_fan
    this.radio = opt.radio
    this.tracklist = opt.tracklist
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      link: this.link,
      share: this.share,
      picture: this.picture,
      picture_small: this.picture_small,
      picture_medium: this.picture_medium,
      picture_big: this.picture_big,
      picture_xl: this.picture_xl,
      nb_album: this.nb_album,
      nb_fan: this.nb_fan,
      radio: this.radio,
      tracklist: this.tracklist,
    }
  }

  static URL() {
    return 'https://api.deezer.com/artist'
  }

  static generateURL(id) {
    return `${Artist.URL()}/${id}`
  }

}

module.exports = Artist
