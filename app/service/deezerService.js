global.Promise = require('bluebird')
const request = require('./request')
const User = require('../model/User')
const Genre = require('../model/Genre')
const Artist = require('../model/Artist')
const Album = require('../model/Album')
const Playlist = require('../model/Playlist')
const Track = require('../model/Track')
const queue = require('./queue').configure({ maxItems: 50, ms: 5000 })

// const myRequest = async () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve('my god!')
//     }, 2000);
//   })
// }

// queue.add(myRequest).then(result => {
//   console.log(`Result: ${result}`)
// })

class DeezerService {

  async getAlbum(id) {
    return new Album(await req(Album.generateURL(id)))
  }

  async getArtist(id) {
    return new Artist(await req(Artist.generateURL(id)))
  }

  async getTrack(id) {
    return new Track(await req(Track.generateURL(id)))
  }

  async getPlaylistTrackAlbumQueue(id) {
    const start = new Date()
    const p = new Playlist(await queue.add(async () => await req(Playlist.generateURL(id))))
    p.tracks = await Promise.map(p.tracks, async (track) => {
      return await queue.add(async () => await this.getTrack(track.id))
    })
    p.tracks = await Promise.map(p.tracks, async(track) => {
      console.log(track.album.id)
      track.album = await queue.add(async () => await this.getAlbum(track.album.id))
      return track
    })
    const end = new Date()
    console.log(`Time: ${end.getTime() - start.getTime()}`)
    return p
  }

  // THROW ERROR DUE TO OVER CALL
  async getPlaylistTrackAlbum(id) {
    const start = new Date()
    const p = new Playlist(await req(Playlist.generateURL(id)))
    p.tracks = await Promise.map(p.tracks, async (track) => await this.getTrack(track.id))
    p.tracks = await Promise.map(p.tracks, async (track) => {
      track.album = await this.getAlbum(track.album.id)
      return track
    })
    const end = new Date()
    console.log(`Time: ${end.getTime() - start.getTime()}`)
    return p
  }

  async getPlaylistTrack(id) {
    const start = new Date()
    const p = new Playlist(await req(Playlist.generateURL(id)))
    p.tracks = await Promise.map(p.tracks, async (track) => await this.getTrack(track.id))
    const end = new Date()
    console.log(`Time: ${end.getTime() - start.getTime()}`)
    return p
  }

  async getPlaylist(id) {
    const start = new Date()
    const p = new Playlist(await req(Playlist.generateURL(id)))
    const end = new Date()
    console.log(`Time: ${end.getTime() - start.getTime()}`)
    return p
  }

  async getUser(id) {
    return new User(await req(User.generateURL(id)))
  }

  async getGenre(id) {
    return new Genre(await req(Genre.generateURL(id)))
  }

}

const req = async (url) => {
  const res = await request.get(url, {json: true, resolveWithFullResponse: true})
  if (res.statusCode !== 200) {
    console.log(`ERROR HERE ${res.statusCode}`)
    process.exit()
  }
  if (res.body.error) {
    console.log(url)
    console.log(res.body.error)
    if (res.body.error.code !== 800) {
      process.exit()
    }
  }
  return res.body
}

const deezerService = new DeezerService()

// deezerService.getAlbum(6859197)
//   .then(album => console.log(album))

// deezerService.getArtist(6859197)
//   .then(album => console.log(album))

// deezerService.getPlaylist(4342095322)
//   .then(playlist => {
//     // console.log(playlist.tracks[0].album)
//   })

// deezerService.getPlaylistTrack(4342095322)
//   .then(playlist => {
//     // console.log(playlist.tracks[0].album)
//   })

deezerService.getPlaylistTrackAlbum(4365632922)
  .then(playlist => {
    // console.log(playlist.tracks[0].album)
  })

// deezerService.getTrack(143160834)
//   .then(track => console.log(track))

// deezerService.getPlaylistTrackAlbumQueue(4365632922)
//   .then(playlist => console.log(playlist.title))

module.exports = deezerService
