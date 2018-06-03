const url = require('url')
const dateformat = require('dateformat')
const Genre = require('./Genre')
const Artist = require('./Artist')
const Track = require('./Track')

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
   * @param {object[]} [options.tracks]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.title = opt.title
    this.upc = opt.upc
    this.link = opt.link ? new url.URL(opt.link) : null
    this.share = opt.share ? new url.URL(opt.share) : null
    this.cover = opt.cover ? new url.URL(opt.cover) : null
    this.cover_small = opt.cover_small ? new url.URL(opt.cover_small) : null
    this.cover_medium = opt.cover_medium ? new url.URL(opt.cover_medium) : null
    this.cover_big = opt.cover_big ? new url.URL(opt.cover_big) : null
    this.cover_xl = opt.cover_xl ? new url.URL(opt.cover_xl) : null
    if (!opt.genres) opt.genres = {}
    if (!opt.genres.data) opt.genres.data = []
    this.genres = opt.genres.data.map(g => new Genre(g))
    this.label = opt.label
    this.nb_tracks = opt.nb_tracks
    this.duration = opt.duration
    this.fans = opt.fans
    this.rating = opt.rating
    this.release_date = opt.release_date ? new Date(opt.release_date) : null
    this.record_type = opt.record_type
    this.available = opt.available
    this.alternative = opt.alternative ? new Album(opt.alternative) : null
    this.tracklist = opt.tracklist ? new url.URL(opt.tracklist) : null
    this.explicit_lyrics = opt.explicit_lyrics
    this.contributors = opt.contributors ? opt.contributors.map(c => new Artist(c)) : []
    this.artist = opt.artist ? new Artist(opt.artist) : null
    this.tracks = opt.tracks ? opt.tracks.map(t => new Track(t)) : []
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      upc: this.upc,
      link: this.link ? this.link.toJSON() : null,
      share: this.share ? this.share.toJSON() : null,
      cover: this.cover ? this.cover.toJSON() : null,
      cover_small: this.cover_small ? this.cover_small.toJSON() : null,
      cover_medium: this.cover_medium ? this.cover_medium.toJSON() : null,
      cover_big: this.cover_big ? this.cover_big.toJSON() : null,
      cover_xl: this.cover_xl ? this.cover_xl.toJSON() : null,
      genres: this.genres ? this.genres.map(g => g.toJSON()) : null,
      label: this.label,
      nb_tracks: this.nb_tracks,
      duration: this.duration,
      fans: this.fans,
      rating: this.rating,
      release_date: this.release_date ? dateformat(this.release_date, 'yyyy-mm-dd') : null,
      record_type: this.record_type,
      available: this.available,
      alternative: this.alternative ? this.alternative.toJSON() : null,
      tracklist: this.tracklist ? this.tracklist.toJSON() : null,
      explicit_lyrics: this.explicit_lyrics,
      contributors: this.contributors.map(c => c.toJSON()),
      artist: this.artist ? this.artist.toJSON() : null,
      tracks: this.tracks.map(t => t.toJSON()),
    }
  }

  static URL() {
    return new url.URL('https://api.deezer.com/album/')
  }

  static generateURL(id) {
    return `${Album.URL().toString()}/${id}`
  }
}

module.exports = Album
