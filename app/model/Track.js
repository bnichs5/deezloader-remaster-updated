const BaseTrack = require('./BaseTrack')
const Album = require('./Album')

class Track extends BaseTrack {

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
    super(opt)
    this.album = opt.album ? new Album(opt.album) : undefined
  }

  toJSON() {
    let json = super.toJSON()
    json.album = this.album ? this.album.toJSON() : undefined
    return json
  }

}

module.exports = Track
