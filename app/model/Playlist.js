const url = require('url')
const User = require('./User')
const Track = require('./Track')

class Playlist {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.title]
   * @param {string} [options.description]
   * @param {number} [options.duration]
   * @param {boolean} [options.public]
   * @param {boolean} [options.is_loved_track]
   * @param {boolean} [options.collaborative]
   * @param {number} [options.rating]
   * @param {number} [options.nb_tracks]
   * @param {number} [options.unseen_track_count]
   * @param {number} [options.fans]
   * @param {string} [options.link]
   * @param {string} [options.share]
   * @param {string} [options.picture]
   * @param {string} [options.picture_small]
   * @param {string} [options.picture_medium]
   * @param {string} [options.picture_big]
   * @param {string} [options.picture_xl]
   * @param {string} [options.checksum]
   * @param {object} [options.creator]
   * @param {object[]} [options.tracks]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.title = opt.title
    this.description = opt.description
    this.duration = opt.duration
    this.public = opt.public
    this.is_loved_track = opt.is_loved_track
    this.collaborative = opt.collaborative
    this.rating = opt.rating
    this.nb_tracks = opt.nb_tracks
    this.unseen_track_count = opt.unseen_track_count
    this.fans = opt.fans
    this.link = new url.URL(opt.link)
    this.share = new url.URL(opt.share)
    this.picture = new url.URL(opt.picture)
    this.picture_small = new url.URL(opt.picture_small)
    this.picture_medium = new url.URL(opt.picture_medium)
    this.picture_big = new url.URL(opt.picture_big)
    this.picture_xl = new url.URL(opt.picture_xl)
    this.checksum = opt.checksum
    this.creator = new User(opt.creator)
    this.tracks = opt.tracks ? opt.tracks.map(t => new Track(t)) : []
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      duration: this.duration,
      public: this.public,
      is_loved_track: this.is_loved_track,
      collaborative: this.collaborative,
      rating: this.rating,
      nb_tracks: this.nb_tracks,
      unseen_track_count: this.unseen_track_count,
      fans: this.fans,
      link: this.link.toJSON(),
      share: this.share.toJSON(),
      picture: this.picture.toJSON(),
      picture_small: this.picture_small.toJSON(),
      picture_medium: this.picture_medium.toJSON(),
      picture_big: this.picture_big.toJSON(),
      picture_xl: this.picture_xl.toJSON(),
      checksum: this.checksum,
      creator: this.creator,
      tracks: this.tracks.map(t => t.toJSON())
    }
  }
}

module.exports = Playlist
