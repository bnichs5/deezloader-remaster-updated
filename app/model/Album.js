const dateformat = require('dateformat')
const Genre = require('./Genre')
const Artist = require('./Artist')
const AlbumTrack = require('./AlbumTrack')

class Album {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.title]
   * @param {string} [options.upc]
   * @param {string} [options.link]
   * @param {string} [options.share]
   * @param {string} [options.cover]
   * @param {string} [options.cover_small]
   * @param {string} [options.cover_medium]
   * @param {string} [options.cover_big]
   * @param {string} [options.cover_xl]
   * @param {object} [options.genres]
   * @param {string} [options.label]
   * @param {number} [options.nb_tracks]
   * @param {number} [options.duration]
   * @param {number} [options.fans]
   * @param {number} [options.rating]
   * @param {string} [options.release_date]
   * @param {string} [options.record_type]
   * @param {boolean} [options.available]
   * @param {object} [options.alternative]
   * @param {string} [options.tracklist]
   * @param {boolean} [options.explicit_lyrics]
   * @param {object[]} [options.contributors]
   * @param {object} [options.artist]
   * @param {object} [options.tracks]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.title = opt.title
    this.upc = opt.upc
    this.link = opt.link
    this.share = opt.share
    this.cover = opt.cover
    this.cover_small = opt.cover_small
    this.cover_medium = opt.cover_medium
    this.cover_big = opt.cover_big
    this.cover_xl = opt.cover_xl
    if (!opt.genres) opt.genres = {}
    if (!opt.genres.data) opt.genres.data = []
    this.genres = opt.genres.data.map(g => new Genre(g))
    this.label = opt.label
    this.nb_tracks = opt.nb_tracks
    this.duration = opt.duration
    this.fans = opt.fans
    this.rating = opt.rating
    this.release_date = opt.release_date ? new Date(opt.release_date) : undefined
    this.record_type = opt.record_type
    this.available = opt.available
    this.alternative = opt.alternative ? new Album(opt.alternative) : undefined
    this.tracklist = opt.tracklist
    this.explicit_lyrics = opt.explicit_lyrics
    this.contributors = opt.contributors ? opt.contributors.map(c => new Artist(c)) : []
    this.artist = opt.artist ? new Artist(opt.artist) : undefined
    if (!opt.tracks) opt.tracks = {}
    if (!opt.tracks.data) opt.tracks.data = []
    /** @type {AlbumTrack[]} */
    this.tracks = opt.tracks ? opt.tracks.data.map(t => new AlbumTrack(t)) : []
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      upc: this.upc,
      link: this.link,
      share: this.share,
      cover: this.cover,
      cover_small: this.cover_small,
      cover_medium: this.cover_medium,
      cover_big: this.cover_big,
      cover_xl: this.cover_xl,
      genres: this.genres ? this.genres.map(g => g.toJSON()) : undefined,
      label: this.label,
      nb_tracks: this.nb_tracks,
      duration: this.duration,
      fans: this.fans,
      rating: this.rating,
      release_date: this.release_date ? dateformat(this.release_date, 'yyyy-mm-dd') : undefined,
      record_type: this.record_type,
      available: this.available,
      alternative: this.alternative ? this.alternative.toJSON() : undefined,
      tracklist: this.tracklist,
      explicit_lyrics: this.explicit_lyrics,
      contributors: this.contributors.map(c => c.toJSON()),
      artist: this.artist ? this.artist.toJSON() : undefined,
      tracks: this.tracks.map(t => t.toJSON()),
    }
  }

  static URL() {
    return 'https://api.deezer.com/album'
  }

  static generateURL(id) {
    return `${Album.URL()}/${id}`
  }

}

module.exports = Album
