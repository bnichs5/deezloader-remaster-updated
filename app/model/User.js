const url = require('url')

class User {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.name]
   * @param {string} [options.lastname]
   * @param {string} [options.firstname]
   * @param {string} [options.email]
   * @param {number} [options.status]
   * @param {string} [options.birthday]
   * @param {string} [options.inscription_date]
   * @param {string} [options.gender]
   * @param {string} [options.link]
   * @param {string} [options.picture]
   * @param {string} [options.picture_small]
   * @param {string} [options.picture_medium]
   * @param {string} [options.picture_big]
   * @param {string} [options.picture_xl]
   * @param {string} [options.country]
   * @param {string} [options.lang]
   * @param {boolean} [options.is_kid]
   * @param {string} [options.tracklist]
   *
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.name = opt.name
    this.lastname = opt.lastname
    this.firstname = opt.firstname
    this.email = opt.email
    this.status = opt.status
    this.birthday = opt.birthday ? new Date(opt.birthday) : null
    this.inscription_date = opt.inscription_date ? new Date(opt.inscription_date) : null
    this.gender = opt.gender
    this.link = opt.link ? new url.URL(opt.link) : null
    this.picture = opt.picture ? new url.URL(opt.picture) : null
    this.picture_small = opt.picture_small ? new url.URL(opt.picture_small) : null
    this.picture_medium = opt.picture_medium ? new url.URL(opt.picture_medium) : null
    this.picture_big = opt.picture_big ? new url.URL(opt.picture_big) : null
    this.picture_xl = opt.picture_xl ? new url.URL(opt.picture_xl) : null
    this.country = opt.country
    this.lang = opt.lang
    this.is_kid = opt.is_kid
    this.tracklist = opt.tracklist ? new url.URL(opt.tracklist) : null
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      lastname: this.lastname,
      firstname: this.firstname,
      email: this.email,
      status: this.status,
      birthday: this.birthday,
      inscription_date: this.inscription_date,
      gender: this.gender,
      link: this.link ? this.link.toJSON() : null,
      picture: this.picture ? this.picture.toJSON() : null,
      picture_small: this.picture_small ? this.picture_small.toJSON() : null,
      picture_medium: this.picture_medium ? this.picture_medium.toJSON() : null,
      picture_big: this.picture_big ? this.picture_big.toJSON() : null,
      picture_xl: this.picture_xl ? this.picture_xl.toJSON() : null,
      country: this.country,
      lang: this.lang,
      is_kid: this.is_kid,
      tracklist: this.tracklist ? this.tracklist.toJSON() : null,
    }
  }

  static URL() {
    return new url.URL('https://api.deezer.com/user/')
  }

  static generateURL(id) {
    return `${User.URL().toString()}/${id}`
  }
}

module.exports = User
