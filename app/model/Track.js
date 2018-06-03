const url = require('url')
const dateformat = require('dateformat')
const Artist = require('./Artist')
const Album = require('./Album')

class Track {

  /**
   *
   * @param {object} [options]
   * @param {number} [options.id]
   * @param {string} [options.readable]
   * @param {string} [options.title]
   * @param {string} [options.title_short]
   * @param {string} [options.title_version]
   * @param {boolean} [options.unseen]
   * @param {string} [options.isrc]
   * @param {string} [options.link]
   * @param {string} [options.share]
   * @param {number} [options.duration]
   * @param {number} [options.track_position]
   * @param {number} [options.disk_number]
   * @param {number} [options.rank]
   * @param {string} [options.release_date]
   * @param {boolean} [options.explicit_lyrics]
   * @param {string} [options.preview]
   * @param {number} [options.bpm]
   * @param {number} [options.gain]
   * @param {string[]} [options.available_countries]
   * @param {object} [options.alternative]
   * @param {object[]} [options.contributors]
   * @param {object} [options.artist]
   * @param {object} [options.album]
   */
  constructor(options) {
    const opt = options || {}
    this.id = opt.id
    this.readable = opt.readable
    this.title = opt.title
    this.title_short = opt.title_short
    this.title_version = opt.title_version
    this.unseen = opt.unseen
    this.isrc = opt.isrc
    this.link = new url.URL(opt.link)
    this.share = new url.URL(opt.share)
    this.duration = opt.duration
    this.track_position = opt.track_position
    this.disk_number = opt.disk_number
    this.rank = opt.rank
    if (opt.release_date) this.release_date = new Date(opt.release_date)
    this.explicit_lyrics = opt.explicit_lyrics
    this.preview = new url.URL(opt.preview)
    this.bpm = opt.bpm
    this.gain = opt.gain
    this.available_countries = opt.available_countries || []
    if (opt.alternative) this.alternative = new Track(opt.alternative)
    this.contributors = opt.contributors ? opt.contributors.map(c => new Artist(c)) : []
    this.artist = new Artist(opt.artist)
    this.album = new Album(opt.album)
  }

  toJSON() {
    let json = {
      id: this.id,
      readable: this.readable,
      title: this.title,
      title_short: this.title_short,
      title_version: this.title_version,
      unseen: this.unseen,
      isrc: this.isrc,
      link: this.link.toJSON(),
      share: this.share.toJSON(),
      duration: this.duration,
      track_position: this.track_position,
      disk_number: this.disk_number,
      rank: this.rank,
      release_date: dateformat(this.release_date, 'yyyy-mm-dd'),
      explicit_lyrics: this.explicit_lyrics,
      preview: this.preview.toJSON(),
      bpm: this.bpm,
      gain: this.gain,
      available_countries: this.available_countries,
      contributors: this.contributors.map(c => c.toJSON()),
      artist: this.artist.toJSON(),
      album: this.album.toJSON(),
    }
    if (this.alternative instanceof Track) json.alternative = this.alternative.toJSON()
    return json
  }
}

module.exports = Track
