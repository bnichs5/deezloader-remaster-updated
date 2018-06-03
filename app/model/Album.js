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
   * @param {object[]} [options.genres]
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
    this.link = new url.URL(opt.link)
    this.share = new url.URL(opt.share)
    this.cover = new url.URL(opt.cover)
    this.cover_small = new url.URL(opt.cover_small)
    this.cover_medium = new url.URL(opt.cover_medium)
    this.cover_big = new url.URL(opt.cover_big)
    this.cover_xl = new url.URL(opt.cover_xl)
    this.genres = opt.genres ? opt.genres.map(g => new Genre(g)) : []
    this.label = opt.label
    this.nb_tracks = opt.nb_tracks
    this.duration = opt.duration
    this.fans = opt.fans
    this.rating = opt.rating
    if (opt.release_date) this.release_date = new Date(opt.release_date)
    this.record_type = opt.record_type
    this.available = opt.available
    if (opt.alternative) this.alternative = new Album(opt.alternative)
    this.tracklist = new url.URL(opt.tracklist)
    this.explicit_lyrics = opt.explicit_lyrics
    this.contributors = opt.contributors ? opt.contributors.map(c => new Artist(c)) : []
    this.artist = new Artist(opt.artist)
    this.tracks = opt.tracks ? opt.tracks.map(t => new Track(t)) : []
  }

  toJSON() {
    let json = {
      id: this.id,
      title: this.title,
      upc: this.upc,
      link: this.link.toJSON(),
      share: this.share.toJSON(),
      cover: this.cover.toJSON(),
      cover_small: this.cover_small.toJSON(),
      cover_medium: this.cover_medium.toJSON(),
      cover_big: this.cover_big.toJSON(),
      cover_xl: this.cover_xl.toJSON(),
      genres: this.genres.map(g => g.toJSON()),
      label: this.label,
      nb_tracks: this.nb_tracks,
      duration: this.duration,
      fans: this.fans,
      rating: this.rating,
      release_date: dateformat(this.release_date, 'yyyy-mm-dd'),
      record_type: this.record_type,
      available: this.available,
      tracklist: this.tracklist.toJSON(),
      explicit_lyrics: this.explicit_lyrics,
      contributors: this.contributors.map(c => c.toJSON()),
      artist: this.artist.toJSON(),
      tracks: this.tracks.map(t => t.toJSON()),
    }
    if (this.alternative instanceof Album) json.alternative = this.alternative.toJSON()
    return json
  }
}

module.exports = Album
