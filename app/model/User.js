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
    this.birthday = new Date(opt.birthday)
    this.inscription_date = new Date(opt.inscription_date)
    this.gender = opt.gender
    this.link = new url.URL(opt.link)
    this.picture = new url.URL(opt.picture)
    this.picture_small = new url.URL(opt.picture_small)
    this.picture_medium = new url.URL(opt.picture_medium)
    this.picture_big = new url.URL(opt.picture_big)
    this.picture_xl = new url.URL(opt.picture_xl)
    this.country = opt.country
    this.lang = opt.lang
    this.is_kid = opt.is_kid
    this.tracklist = new url.URL(opt.tracklist)
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
      link: this.link.toJSON(),
      picture: this.picture.toJSON(),
      picture_small: this.picture_small.toJSON(),
      picture_medium: this.picture_medium.toJSON(),
      picture_big: this.picture_big.toJSON(),
      picture_xl: this.picture_xl.toJSON(),
      country: this.country,
      lang: this.lang,
      is_kid: this.is_kid,
      tracklist: this.tracklist.toJSON(),
    }
  }
}

module.exports = User
