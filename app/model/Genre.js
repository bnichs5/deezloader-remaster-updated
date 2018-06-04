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
    this.picture = opt.picture
    this.picture_small = opt.picture_small
    this.picture_medium = opt.picture_medium
    this.picture_big = opt.picture_big
    this.picture_xl = opt.picture_xl
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      picture: this.picture,
      picture_small: this.picture_small,
      picture_medium: this.picture_medium,
      picture_big: this.picture_big,
      picture_xl: this.picture_xl,
    }
  }

  static URL() {
    return 'https://api.deezer.com/genre'
  }

  static generateURL(id) {
    return `${Genre.URL()}/${id}`
  }

}

module.exports = Genre
