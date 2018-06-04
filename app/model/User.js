const dateformat = require('dateformat')

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
    this.birthday = opt.birthday ? new Date(opt.birthday) : undefined
    this.inscription_date = opt.inscription_date ? new Date(opt.inscription_date) : undefined
    this.gender = opt.gender
    this.link = opt.link
    this.picture = opt.picture
    this.picture_small = opt.picture_small
    this.picture_medium = opt.picture_medium
    this.picture_big = opt.picture_big
    this.picture_xl = opt.picture_xl
    this.country = opt.country
    this.lang = opt.lang
    this.is_kid = opt.is_kid
    this.tracklist = opt.tracklist
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      lastname: this.lastname,
      firstname: this.firstname,
      email: this.email,
      status: this.status,
      birthday: this.birthday ? dateformat(this.birthday, 'yyyy-mm-dd') : undefined,
      inscription_date: this.inscription_date ?
        dateformat(this.inscription_date, 'yyyy-mm-dd') : undefined,
      gender: this.gender,
      link: this.link,
      picture: this.picture,
      picture_small: this.picture_small,
      picture_medium: this.picture_medium,
      picture_big: this.picture_big,
      picture_xl: this.picture_xl,
      country: this.country,
      lang: this.lang,
      is_kid: this.is_kid,
      tracklist: this.tracklist,
    }
  }

  static URL() {
    return 'https://api.deezer.com/user'
  }

  static generateURL(id) {
    return `${User.URL()}/${id}`
  }

}

module.exports = User
