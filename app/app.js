/*
 *  _____                    _                    _
 * |  __ \                  | |                  | |
 * | |  | |  ___   ___  ____| |  ___    __ _   __| |  ___  _ __
 * | |  | | / _ \ / _ \|_  /| | / _ \  / _` | / _` | / _ \| '__|
 * | |__| ||  __/|  __/ / / | || (_) || (_| || (_| ||  __/| |
 * |_____/  \___| \___|/___||_| \___/  \__,_| \__,_| \___||_|
 *
 *
 *
 *  Maintained by ivandelabeldad <https://github.com/ivandelabeldad/>
 *  Original work by ZzMTV <https://boerse.to/members/zzmtv.3378614/>
 * */

const server = require('./server')
/** @type{*} */
const mflac = require('flac-metadata')
const fs = require('fs-extra')
const async = require('async')
/** @type{*} */
const request = require('requestretry').defaults({
	maxAttempts: 2147483647,
	retryDelay: 1000,
	timeout: 8000
})
const ID3Writer = require('./lib/browser-id3-writer')
const Deezer = require('./service/deezer')
const path = require('path')
const { settings, userSettings } = require('./service/config')
const { pad, antiDot, fixName, settingsRegex, settingsRegexAlbum, splitNumber } = require('./utils/helpers')
const paths = require('./utils/paths')
const packageJson = fs.readJSONSync(paths.packageJson)
const logger = require('./service/logger')
const updater = require('./service/updater')
const encryptor = require('./service/encryptor')
const login = require('./service/login')
const { E } = require('./utils/events')

server.onConnection((socket) => {

	socket.emit(E.BACK.VERSION, packageJson.version)
	socket.downloadQueue = [];
	socket.currentItem = null;
	socket.lastQueueId = null;
	updater.check().then(status => {
		if (!status.updated) {
			socket.emit(E.BACK.NEWUPDATE, status.latestVersion, status.link)
		}
	})

	socket.on(E.FRONT.LOGIN, (username, password, autoLoginChecked) => {
		login.login(socket, username, password, autoLoginChecked)
	})

	socket.on(E.FRONT.AUTOLOGIN, () => login.autoLogin(socket))

	socket.on(E.FRONT.LOGOUT, login.logout)

	socket.on(E.FRONT.DOWNLOADTRACK, (data) => {
		Deezer.getTrack(data.id, function (track, err) {
			if (err) {
				return;
			}
			let queueId = "id" + Math.random().toString(36).substring(2);
			let _track = {
				name: track["SNG_TITLE"],
				size: 1,
				downloaded: 0,
				failed: 0,
				queueId: queueId,
				id: track["SNG_ID"],
				type: "track"
			};
			if (track["VERSION"]) _track.name = _track.name + " " + track["VERSION"];
			_track.settings = data.settings || {};
			addToQueue(_track);
		});
	})

	socket.on(E.FRONT.DOWNLOADPLAYLIST, (data) => {
		Deezer.getPlaylist(data.id)
			.then(playlist => {
				logger.info(`Downloading playlist ${playlist.title}. Size: ${playlist.tracks.data.length}`)
				const size = playlist.tracks.data.length
				let queueId = `id${Math.random().toString(36).substring(2)}`;
				let _playlist = {
					name: playlist.title,
					size: size,
					downloaded: 0,
					failed: 0,
					queueId: queueId,
					id: playlist.id,
					type: 'playlist',
					tracks: playlist.tracks,
				};
				_playlist.settings = data.settings || {};
				addToQueue(_playlist);
			})
			.catch(e => {throw new Error(e)})
	})

	socket.on(E.FRONT.DOWNLOADALBUM, (data) => {
		Deezer.getAlbum(data.id)
			.then(album => {
				let queueId = "id" + Math.random().toString(36).substring(2);
				let _album = {
					name: album["title"],
					label: album["label"],
					artist: album["artist"].name,
					size: album.tracks.data.length,
					downloaded: 0,
					failed: 0,
					queueId: queueId,
					id: album["id"],
					type: "album",
					tracks: album.tracks,
				};
				_album.settings = data.settings || {}
				addToQueue(_album)
			})
			.catch(e => { throw new Error(e) })
	})

	socket.on(E.FRONT.DOWNLOADARTIST, (data) => {
		let artist
		Deezer.getArtist(data.id)
			.then(a => {
				artist = a
				return Deezer.getArtistAlbums(data.id)
			})
			.then(albums => {
				for (let i = 0; i < albums.data.length; i++) {
					Deezer.getAlbum(albums.data[i].id)
						.then(album => {
							let queueId = `id${Math.random().toString(36).substring(2)}`
							let _album = {
								name: album.title,
								artist: artist.name,
								size: album.tracks.data.length,
								downloaded: 0,
								failed: 0,
								queueId: queueId,
								id: album.id,
								type: 'album',
								countPerAlbum: true,
								tracks: album.tracks,
							};
							_album.settings = data.settings || {}
							addToQueue(_album);
						})
						.catch(e => { throw new Error(e) })
				}
			})
			.catch(e => { throw new Error(e) })
	})

	socket.on(E.FRONT.GETCHARTSCOUNTRYLIST, (data) => {
		Deezer.getChartsTopCountry()
			.then(charts => {
				let countries = [];
				for (let i = 0; i < charts.length; i++) {
					let obj = {
						country: charts[i].title.replace("Top ", ""),
						picture_small: charts[i].picture_small,
						picture_medium: charts[i].picture_medium,
						picture_big: charts[i].picture_big
					};
					countries.push(obj);
				}
				socket.emit(E.BACK.GETCHARTSCOUNTRYLIST, {
					countries: countries,
					selected: data.selected
				});
			})
			.catch(e => { throw new Error(e) })
	})

	socket.on(E.FRONT.GETCHARTSTRACKLISTBYCOUNTRY, (data) => {
		if (!data.country) {
			socket.emit(E.BACK.GETCHARTSTRACKLISTBYCOUNTRY, {
				err: "No country passed"
			});
			return;
		}

		let charts
		let countries = []
		Deezer.getChartsTopCountry()
			.then(c => {
				charts = c
				for (let i = 0; i < charts.length; i++) {
					countries.push(charts[i].title.replace("Top ", ""));
				}
				if (countries.indexOf(data.country) == -1) {
					socket.emit(E.BACK.GETCHARTSTRACKLISTBYCOUNTRY, {
						err: "Country not found"
					});
					return;
				}
				let playlistId = charts[countries.indexOf(data.country)].id;
				return Deezer.getPlaylist(playlistId)
			})
			.then(playlist => {
				socket.emit(E.BACK.GETCHARTSTRACKLISTBYCOUNTRY, {
					playlist: charts[countries.indexOf(data.country)],
					tracks: playlist.tracks.data
				})
			})
			.catch(e => {
				socket.emit(E.BACK.GETCHARTSTRACKLISTBYCOUNTRY, { error: e })
			})
	})

	socket.on(E.FRONT.MYPLAYLISTS, () => {
		Deezer.getMyPlaylists().then(searchObject => {
			socket.emit(E.BACK.MYPLAYLISTS, searchObject.data)
		})
	})

	socket.on(E.FRONT.SEARCH, (data) => {
		Deezer.search(encodeURIComponent(data.text), data.type)
			.then(searchObject => {
				socket.emit(E.BACK.SEARCH, {
					type: data.type,
					items: searchObject.data
				})
			})
			.catch(e => {
				socket.emit(E.BACK.SEARCH, {
					type: data.type,
					items: []
				})
			})
	})

	socket.on(E.FRONT.GETTRACKLIST, (data) => {
		switch(data.type) {
			case 'artist':
				Deezer.getArtistAlbums(data.id)
					.then(albums => {
						socket.emit(E.BACK.GETTRACKLIST, {
							response: albums,
							id: data.id,
							reqType: data.type
						})
					})
					.catch(e => {
						socket.emit(E.BACK.GETTRACKLIST, {
							err: "wrong id",
							response: {},
							id: data.id,
							reqType: data.type
						})
					})
				break;
			case 'album':
				Deezer.getAlbum(data.id)
					.then(album => {
						socket.emit(E.BACK.GETTRACKLIST, {
							response: album.tracks,
							id: data.id,
							reqType: data.type
						})
					})
					.catch(e => {
						socket.emit(E.BACK.GETTRACKLIST, {
							err: 'wrong id',
							response: {},
							id: data.id,
							reqType: data.type
						})
					})
				break;
			case 'playlist':
				Deezer.getPlaylist(data.id)
					.then(playlist => {
						socket.emit(E.BACK.GETTRACKLIST, {
							response: playlist.tracks,
							id: data.id,
							reqType: data.type
						})
					})
					.catch(e => {
						socket.emit(E.BACK.GETTRACKLIST, {
							err: 'wrong id',
							response: {},
							id: data.id,
							reqType: data.type
						})
					})
				break;
			default:
				logger.error(`Cannot get track list of type ${data.type}`)
				socket.emit(E.BACK.GETTRACKLIST, {
					err: `Cannot get track list of type ${data.type}`
				})
		}
	})

	socket.on(E.FRONT.CANCELDOWNLOAD, (data) => {
		if (!data.queueId) {
			return
		}

		let cancel = false
		let cancelSuccess

		for (let i = 0; i < socket.downloadQueue.length; i++) {
			if (data.queueId == socket.downloadQueue[i].queueId) {
				socket.downloadQueue.splice(i, 1)
				i--
				cancel = true
			}
		}

		if (socket.currentItem && socket.currentItem.queueId == data.queueId) {
			cancelSuccess = Deezer.cancelDecryptTrack()
			cancel = cancel || cancelSuccess
		}

		if (cancelSuccess && socket.currentItem) {
			socket.currentItem.cancelFlag = true
		}
		if (cancel) {
			socket.emit(E.BACK.CANCELDOWNLOAD, { queueId: data.queueId })
		}
	})

	socket.on(E.FRONT.GETUSERSETTINGS, () => {
		let settings = userSettings.read()
		socket.emit(E.BACK.GETUSERSETTINGS, { settings })
	})

	socket.on(E.FRONT.SAVESETTINGS, userSettings.update)

	function addToQueue(object) {
		socket.downloadQueue.push(object);
		socket.emit(E.BACK.ADDTOQUEUE, object);

		queueDownload(getNextDownload());
	}

	function getNextDownload() {
		if (socket.currentItem != null || socket.downloadQueue.length == 0) {
			if (socket.downloadQueue.length == 0 && socket.currentItem == null) {
				socket.emit(E.BACK.EMPTYDOWNLOADQUEUE, {});
			}
			return null;
		}
		socket.currentItem = socket.downloadQueue[0];
		return socket.currentItem;
	}

	//currentItem: the current item being downloaded at that moment such as a track or an album
	//downloadQueue: the tracks in the queue to be downloaded
	//lastQueueId: the most recent queueID
	//queueId: random number generated when user clicks download on something
	function queueDownload(downloading) {
		if (!downloading) return;

		// New batch emits new message
		if (socket.lastQueueId != downloading.queueId) {
			socket.emit(E.BACK.DOWNLOADSTARTED, {
				queueId: downloading.queueId
			});
			socket.lastQueueId = downloading.queueId;
		}

		if (downloading.type == "track") {
			logger.info(`Registered a track: ${downloading.id}.`)
			downloadTrack([downloading.id, 0], downloading.settings, null, function (err) {
				if (err) {
					downloading.failed++;
				} else {
					downloading.downloaded++;
				}
				socket.emit(E.BACK.UPDATEQUEUE, downloading);
				if (socket.downloadQueue[0] && (socket.downloadQueue[0].queueId == downloading.queueId)) {
					socket.downloadQueue.shift();
				}
				socket.currentItem = null;
				queueDownload(getNextDownload());
			});
		} else if (downloading.type == "playlist") {
			logger.info(`Registered a playlist: ${downloading.id}.`)

			const afterEach = (err) => {
				logger.info(`Playlist finished ${downloading.name}.`)
				if (typeof socket.downloadQueue[0] != 'undefined') {
					socket.emit(E.BACK.DOWNLOADPROGRESS, {
						queueId: socket.downloadQueue[0].queueId,
						percentage: 100
					})
				}
				if (downloading && socket.downloadQueue[0] && socket.downloadQueue[0].queueId == downloading.queueId) socket.downloadQueue.shift()
				socket.currentItem = null
				queueDownload(getNextDownload())
			}

			downloading.playlistContent = downloading.tracks.data.map((t) => {
				if (t.FALLBACK) {
					if (t.FALLBACK.SNG_ID) {
						return [t.id, t.FALLBACK.SNG_ID]
					}
				}
				return [t.id, 0]
			})
			downloading.settings.plName = downloading.name
			// async.eachLimit(downloading.playlistContent, 10, function (id, callback) {
			async.eachSeries(downloading.playlistContent, function (id, callback) {
				if (downloading.cancelFlag) {
					logger.info(`Stopping the playlist queue.`)
					callback('stop')
					return;
				}
				downloading.settings.playlist = {
					position: downloading.playlistContent.indexOf(id),
					fullSize: downloading.playlistContent.length
				}
				logger.info(`Starting download of: ${id}.`)
				downloadTrack(id, downloading.settings, null, function (err) {
					if (!err) {
						downloading.downloaded++
					} else {
						downloading.failed++
					}
					socket.emit(E.BACK.UPDATEQUEUE, downloading)
					callback()
				});
			}, afterEach)

		} else if (downloading.type == "album") {
			logger.info(`Registered an album: ${downloading.id}.`)

			downloading.playlistContent = downloading.tracks.data.map((t) => {
				if (t.FALLBACK) {
					if (t.FALLBACK.SNG_ID) {
						return [t.id, t.FALLBACK.SNG_ID]
					}
				}
				return [t.id, 0]
			})
			downloading.settings.tagPosition = true
			downloading.settings.albName = downloading.name
			downloading.settings.artName = downloading.artist
			async.eachSeries(downloading.playlistContent, function (id, callback) {
				if (downloading.cancelFlag) {
					logger.info('Stopping the album queue.')
					callback('')
					return
				}
				downloading.settings.playlist = {
					position: downloading.playlistContent.indexOf(id),
					fullSize: downloading.playlistContent.length
				};
				downloadTrack(id, downloading.settings, null, function (err) {
					if (!err) {
						downloading.downloaded++
					} else {
						downloading.failed++
					}
					socket.emit(E.BACK.UPDATEQUEUE, downloading)
					callback()
				});
			}, function (err) {
				if (downloading.countPerAlbum) {
					if (socket.downloadQueue.length > 1 && socket.downloadQueue[1].queueId == downloading.queueId) {
						socket.downloadQueue[1].download = downloading.downloaded;
					}
					socket.emit(E.BACK.UPDATEQUEUE, downloading)
				}
				logger.info(`Album finished: ${downloading.name}.`)
				if (typeof socket.downloadQueue[0] != 'undefined') {
					socket.emit(E.BACK.DOWNLOADPROGRESS, {
						queueId: socket.downloadQueue[0].queueId,
						percentage: 100
					})
				}
				if (downloading && socket.downloadQueue[0] && socket.downloadQueue[0].queueId == downloading.queueId) socket.downloadQueue.shift()
				socket.currentItem = null
				queueDownload(getNextDownload())
			})

		}
	}

})

// Show crash error in console for debugging
process.on('uncaughtException', function (err) {
	logger.error(`${err.stack}.`)
})

function downloadTrack(id, options, altmetadata, callback) {
	logger.info('Getting track data.')
	Deezer.getTrack(id[0], function (track, err) {
		if (err) {
			if (id[1] != 0) {
				logger.warn('Failed to download track, falling on alternative.')
				downloadTrack([id[1], 0], options, null, function (err) {
					callback(err);
				});
			} else {
				logger.error('Failed to download track.')
				callback(err);
			}
			return;
		}
		logger.info('Getting album data.')
		let albumRes
		Deezer.getAlbum(track['ALB_ID'])
			.then(res => {
				logger.info('Getting track data.')
				albumRes = res
				return Deezer.getATrack(res.tracks.data[res.tracks.data.length - 1].id)
			})
			.then(tres => {
				track.trackSocket = socket;
				options = options || {};
				if (track["VERSION"]) track["SNG_TITLE"] += " " + track["VERSION"];
				var ajson = albumRes;
				var tjson = tres;
				if (track["SNG_CONTRIBUTORS"]) {
					if (track["SNG_CONTRIBUTORS"].composer) {
						var composertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].composer.length; i++) {
							composertag += track["SNG_CONTRIBUTORS"].composer[i] + ", ";
						}
						composertag = composertag.substring(0, composertag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].musicpublisher) {
						var publishertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].musicpublisher.length; i++) {
							publishertag += track["SNG_CONTRIBUTORS"].musicpublisher[i] + ", ";
						}
						publishertag = publishertag.substring(0, publishertag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].producer) {
						var producertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].producer.length; i++) {
							producertag += track["SNG_CONTRIBUTORS"].producer[i] + ", ";
						}
						producertag = producertag.substring(0, producertag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].engineer) {
						var engineertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].engineer.length; i++) {
							engineertag += track["SNG_CONTRIBUTORS"].engineer[i] + ", ";
						}
						engineertag = engineertag.substring(0, engineertag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].writer) {
						var writertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].writer.length; i++) {
							writertag += track["SNG_CONTRIBUTORS"].writer[i] + ", ";
						}
						writertag = writertag.substring(0, writertag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].author) {
						var authortag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].author.length; i++) {
							authortag += track["SNG_CONTRIBUTORS"].author[i] + ", ";
						}
						authortag = authortag.substring(0, authortag.length - 2);
					}
					if (track["SNG_CONTRIBUTORS"].mixer) {
						var mixertag = "";
						for (var i = 0; i < track["SNG_CONTRIBUTORS"].mixer.length; i++) {
							mixertag += track["SNG_CONTRIBUTORS"].mixer[i] + ", ";
						}
						mixertag = mixertag.substring(0, mixertag.length - 2);
					}
				}
				let metadata;
				if (altmetadata) {
					metadata = altmetadata;
					if (track["LYRICS_TEXT"] && !metadata.unsynchronisedLyrics) {
						metadata.unsynchronisedLyrics = {
							description: "",
							lyrics: track["LYRICS_TEXT"]
						};
					}
				} else {
					metadata = {
						title: track["SNG_TITLE"],
						artist: track["ART_NAME"],
						album: track["ALB_TITLE"],
						performerInfo: ajson.artist.name,
						trackNumber: track["TRACK_NUMBER"] + "/" + ajson.nb_tracks,
						partOfSet: track["DISK_NUMBER"] + "/" + tjson.disk_number,
						ISRC: track["ISRC"],
						length: track["DURATION"],
						BARCODE: ajson.upc,
						explicit: track["EXPLICIT_LYRICS"],
						rtype: ajson.record_type,
						copyright: undefined,
						mixer: undefined,
						composer: undefined,
						producer: undefined,
						writer: undefined,
						author: undefined,
						engineer: undefined,
						publisher: undefined,
						unsynchronisedLyrics: undefined,
						bpm: undefined,
						trackgain: undefined,
						genre: undefined,
						image: undefined,
						date: undefined,
						year: undefined,
					};
					if (track["COPYRIGHT"]) {
						metadata.copyright = track["COPYRIGHT"];
					}
					if (composertag) {
						metadata.composer = composertag;
					}
					if (mixertag) {
						metadata.mixer = mixertag;
					}
					if (authortag) {
						metadata.author = authortag;
					}
					if (writertag) {
						metadata.writer = writertag;
					}
					if (engineertag) {
						metadata.engineer = engineertag;
					}
					if (producertag) {
						metadata.producer = producertag;
					}
					if (track["LYRICS_TEXT"]) {
						metadata.unsynchronisedLyrics = {
							description: "",
							lyrics: track["LYRICS_TEXT"]
						};
					}
					if (publishertag) {
						metadata.publisher = publishertag;
					}
					if (options.plName && !(options.createArtistFolder || options.createAlbumFolder) && !userSettings.read().numplaylistbyalbum) {
						metadata.trackNumber = (parseInt(options.playlist.position) + 1).toString() + "/" + options.playlist.fullSize;
						metadata.partOfSet = "1/1";
					}
					if (options.artName) {
						metadata.trackNumber = (options.playlist.position + 1).toString() + "/" + ajson.nb_tracks;
					}
					if (0 < parseInt(track["BPM"])) {
						metadata.bpm = track["BPM"];
					}
					if (track["GAIN"]) {
						metadata.trackgain = track["GAIN"];
					}
					if (ajson.genres && ajson.genres.data[0] && ajson.genres.data[0].name) {
						metadata.genre = ajson.genres.data[0].name;
					}

					if (track["ALB_PICTURE"]) {
						metadata.image = Deezer.albumPicturesHost + track["ALB_PICTURE"] + options.artworkSize;
					}

					if (ajson.release_date) {
						metadata.year = ajson.release_date.slice(0, 4);
						metadata.date = ajson.release_date;
					} else if (track["PHYSICAL_RELEASE_DATE"]) {
						metadata.year = track["PHYSICAL_RELEASE_DATE"].slice(0, 4);
						metadata.date = track["PHYSICAL_RELEASE_DATE"];
					}
				}
				let filename = fixName(`${metadata.artist} - ${metadata.title}`);
				if (options.filename) {
					filename = fixName(settingsRegex(metadata, options.filename, options.playlist));
				}

				let filepath = userSettings.read().downloadLocation + path.sep;
				if (options.createArtistFolder || options.createAlbumFolder) {
					if (options.plName) {
						filepath += antiDot(fixName(options.plName)) + path.sep;
					}
					if (options.createArtistFolder) {
						if (options.artName) {
							filepath += antiDot(fixName(options.artName)) + path.sep;
						} else {
							filepath += antiDot(fixName(metadata.artist)) + path.sep;
						}
					}

					if (options.createAlbumFolder) {
						if (options.artName) {
							filepath += antiDot(fixName(settingsRegexAlbum(metadata, options.foldername, options.artName, options.albName))) + path.sep;
						} else {
							filepath += antiDot(fixName(settingsRegexAlbum(metadata, options.foldername, metadata.performerInfo, metadata.album))) + path.sep;
						}
					}
				} else if (options.plName) {
					filepath += antiDot(fixName(options.plName)) + path.sep;
				} else if (options.artName) {
					filepath += antiDot(fixName(settingsRegexAlbum(metadata, options.foldername, options.artName, options.albName))) + path.sep;
				}

				let writePath;
				if (track.format == 9) {
					writePath = filepath + filename + '.flac';
				} else {
					writePath = filepath + filename + '.mp3';
				}
				if (track["LYRICS_SYNC_JSON"] && userSettings.read().syncedlyrics) {
					var lyricsbuffer = "";
					for (var i = 0; i < track["LYRICS_SYNC_JSON"].length; i++) {
						if (track["LYRICS_SYNC_JSON"][i].lrc_timestamp) {
							lyricsbuffer += track["LYRICS_SYNC_JSON"][i].lrc_timestamp + track["LYRICS_SYNC_JSON"][i].line + "\r\n";
						} else if (i + 1 < track["LYRICS_SYNC_JSON"].length) {
							lyricsbuffer += track["LYRICS_SYNC_JSON"][i + 1].lrc_timestamp + track["LYRICS_SYNC_JSON"][i].line + "\r\n";
						}
					}
					if (track.format == 9) {
						fs.outputFile(writePath.substring(0, writePath.length - 5) + ".lrc", lyricsbuffer, function () {});
					} else {
						fs.outputFile(writePath.substring(0, writePath.length - 4) + ".lrc", lyricsbuffer, function () {});
					}
				}
				logger.info(`Downloading file to: ${writePath}.`)
				if (fs.existsSync(writePath)) {
					logger.info(`Already downloaded: ${metadata.artist} - ${metadata.title}.`)
					callback();
					return;
				}

				//Get image
				if (metadata.image) {
					let imgPath;
					//If its not from an album but a playlist.
					if (!options.tagPosition && !options.createAlbumFolder) {
						imgPath = paths.tmp + fixName(metadata.ISRC) + ".jpg";
					} else {
						imgPath = filepath + "folder.jpg";
					}
					if (fs.existsSync(imgPath) && imgPath.indexOf(paths.tmp) === -1) {
						metadata.imagePath = (imgPath).replace(/\\/g, "/");
						logger.info(`Starting the download process CODE:1.`)
						condownload();
					} else {
						request.get(metadata.image, {
							encoding: 'binary'
						}, function (error, response, body) {
							if (error) {
								logger.error(`${error.stack}.`)
								metadata.image = undefined;
								metadata.imagePath = undefined;
								return;
							}
							fs.outputFile(imgPath, body, 'binary', function (err) {
								if (err) {
									logger.error(`${error.stack}.`)
									metadata.image = undefined;
									metadata.imagePath = undefined;
									return;
								}
								metadata.imagePath = (imgPath).replace(/\\/g, "/");
								logger.info('Starting the download process CODE:2.')
								condownload();
							})
						});
					}
				} else {
					metadata.image = undefined;
					logger.info('Starting the download process CODE:3.')
					condownload();
				}

				function condownload() {
					var tempPath = writePath + ".temp";
					logger.info('Downloading and decrypting.')
					Deezer.decryptTrack(tempPath, track, function (err) {
						if (err && err.message == "aborted") {
							socket.currentItem.cancelFlag = true;
					logger.info('Track got aborted.')
							callback();
							return;
						}
						if (err) {
							Deezer.hasTrackAlternative(id[0])
								.then(alternative => {
									if (!alternative) throw new Error(`Failed to download: ${metadata.artist} - ${metadata.title}.`)
									logger.warn(`Failed to downloaded: ${metadata.artist} - ${metadata.title}, falling on alternative.`)
									downloadTrack([alternative.SNG_ID, 0], options, metadata, callback)
								})
								.catch(e => {
									logger.warn(`Failed to downloaded: ${metadata.artist} - ${metadata.title}.`)
									callback(e)
								})
							return
						}
						if (options.createM3UFile && options.playlist) {
							if (track.format == 9) {
								fs.appendFileSync(filepath + "playlist.m3u", filename + ".flac\r\n");
							} else {
								fs.appendFileSync(filepath + "playlist.m3u", filename + ".mp3\r\n");
							}
						}
						logger.info(`Downloaded: ${metadata.artist} - ${metadata.title}.`)
						metadata.artist = '';
						var first = true;
						track['ARTISTS'].forEach(function (artist) {
							if (first) {
								metadata.artist = artist['ART_NAME'];
								first = false;
							} else {
								if (metadata.artist.indexOf(artist['ART_NAME']) == -1)
									metadata.artist += ', ' + artist['ART_NAME'];
							}
						});

						if (track.format == 9) {
							let flacComments = [
								'TITLE=' + metadata.title,
								'ALBUM=' + metadata.album,
								'ALBUMARTIST=' + metadata.performerInfo,
								'ARTIST=' + metadata.artist,
								'TRACKNUMBER=' + splitNumber(metadata.trackNumber, false),
								'DISCNUMBER=' + splitNumber(metadata.partOfSet, false),
								'TRACKTOTAL=' + splitNumber(metadata.trackNumber, true),
								'DISCTOTAL=' + splitNumber(metadata.partOfSet, true),
								'LENGTH=' + metadata.length,
								'ISRC=' + metadata.ISRC,
								'BARCODE=' + metadata.BARCODE,
								'ITUNESADVISORY=' + metadata.explicit
							];
							if (metadata.unsynchronisedLyrics) {
								flacComments.push('LYRICS=' + metadata.unsynchronisedLyrics.lyrics);
							}
							if (metadata.genre) {
								flacComments.push('GENRE=' + metadata.genre);
							}
							if (metadata.copyright) {
								flacComments.push('COPYRIGHT=' + metadata.copyright);
							}
							if (0 < parseInt(metadata.year)) {
								flacComments.push('DATE=' + metadata.date);
								flacComments.push('YEAR=' + metadata.year);
							}
							if (0 < parseInt(metadata.bpm)) {
								flacComments.push('BPM=' + metadata.bpm);
							}
							if (metadata.composer) {
								flacComments.push('COMPOSER=' + metadata.composer);
							}
							if (metadata.publisher) {
								flacComments.push('ORGANIZATION=' + metadata.publisher);
							}
							if (metadata.mixer) {
								flacComments.push('MIXER=' + metadata.mixer);
							}
							if (metadata.author) {
								flacComments.push('AUTHOR=' + metadata.author);
							}
							if (metadata.writer) {
								flacComments.push('WRITER=' + metadata.writer);
							}
							if (metadata.engineer) {
								flacComments.push('ENGINEER=' + metadata.engineer);
							}
							if (metadata.producer) {
								flacComments.push('PRODUCER=' + metadata.producer);
							}
							if (metadata.trackgain) {
								flacComments.push('REPLAYGAIN_TRACK_GAIN=' + metadata.trackgain);
							}
							const reader = fs.createReadStream(tempPath);
							const writer = fs.createWriteStream(writePath);
							/** @type{*} */
							let processor = new mflac.Processor({
								parseMetaDataBlocks: true
							});

							let vendor = 'reference libFLAC 1.2.1 20070917';
							let cover = null;
							if (metadata.imagePath) {
								cover = fs.readFileSync(metadata.imagePath);
							}
							let mdbVorbisPicture;
							let mdbVorbisComment;
							processor.on('preprocess', (mdb) => {
								// Remove existing VORBIS_COMMENT and PICTURE blocks, if any.
								if (mflac.Processor.MDB_TYPE_VORBIS_COMMENT === mdb.type) {
									mdb.remove();
								} else if (mflac.Processor.MDB_TYPE_PICTURE === mdb.type) {
									mdb.remove();
								}

								if (mdb.isLast) {
									var res = 0;
									if (userSettings.read().artworkSize.includes("1400")) {
										res = 1400;
									} else if (userSettings.read().artworkSize.includes("1200")) {
										res = 1200;
									} else if (userSettings.read().artworkSize.includes("1000")) {
										res = 1000;
									} else if (userSettings.read().artworkSize.includes("800")) {
										res = 800;
									} else if (userSettings.read().artworkSize.includes("500")) {
										res = 500;
									}
									if (cover) {
										mdbVorbisPicture = mflac.data.MetaDataBlockPicture.create(true, 3, 'image/jpeg', '', res, res, 24, 0, cover);
									}
									mdbVorbisComment = mflac.data.MetaDataBlockVorbisComment.create(false, vendor, flacComments);
									mdb.isLast = false;
								}
							});

							processor.on('postprocess', (mdb) => {
								if (mflac.Processor.MDB_TYPE_VORBIS_COMMENT === mdb.type && null !== mdb.vendor) {
									vendor = mdb.vendor;
								}

								if (mdbVorbisPicture && mdbVorbisComment) {
									processor.push(mdbVorbisComment.publish());
									processor.push(mdbVorbisPicture.publish());
								} else if (mdbVorbisComment) {
									processor.push(mdbVorbisComment.publish());
								}
							});

							reader.on('end', () => {
								fs.remove(tempPath);
							});

							reader.pipe(processor).pipe(writer);
						} else {
							const songBuffer = fs.readFileSync(tempPath);
							/** @type{*} */
							const writer = new ID3Writer(songBuffer);
							writer.setFrame('TIT2', metadata.title)
								.setFrame('TPE1', [metadata.artist])
								.setFrame('TALB', metadata.album)
								.setFrame('TPE2', metadata.performerInfo)
								.setFrame('TRCK', metadata.trackNumber)
								.setFrame('TPOS', metadata.partOfSet)
								.setFrame('TLEN', metadata.length)
								.setFrame('TSRC', metadata.ISRC)
								.setFrame('TXXX', {
									description: 'BARCODE',
									value: metadata.BARCODE
								})
							if (metadata.imagePath) {
								const coverBuffer = fs.readFileSync(metadata.imagePath);
								writer.setFrame('APIC', {
									type: 3,
									data: coverBuffer,
									description: 'front cover'
								});
							}
							if (metadata.unsynchronisedLyrics) {
								writer.setFrame('USLT', metadata.unsynchronisedLyrics);
							}
							if (metadata.publisher) {
								writer.setFrame('TPUB', metadata.publisher);
							}
							if (metadata.genre) {
								writer.setFrame('TCON', [metadata.genre]);
							}
							if (metadata.copyright) {
								writer.setFrame('TCOP', metadata.copyright);
							}
							if (0 < parseInt(metadata.year)) {
								writer.setFrame('TDAT', metadata.date);
								writer.setFrame('TYER', metadata.year);
							}
							if (0 < parseInt(metadata.bpm)) {
								writer.setFrame('TBPM', metadata.bpm);
							}
							if (metadata.composer) {
								writer.setFrame('TCOM', [metadata.composer]);
							}
							if (metadata.trackgain) {
								writer.setFrame('TXXX', {
									description: 'REPLAYGAIN_TRACK_GAIN',
									value: metadata.trackgain
								});
							}
							writer.addTag();

							const taggedSongBuffer = Buffer.from(writer.arrayBuffer);
							fs.writeFileSync(writePath, taggedSongBuffer);
							fs.remove(tempPath);
						}

						callback();
					});
				}
			})
			.catch(e => {
				if (id[1] != 0) {
					logger.warn('Failed to download track, falling on alternative.')
					downloadTrack([id[1], 0], options, null, function (err) {
						callback(err)
					})
				} else {
					logger.error('Failed to download track.')
					callback(new Error('Album does not exists.'))
				}
			})

	})
}

function checkIfAlreadyInQueue(id) {
	let exists = false;
	for (let i = 0; i < socket.downloadQueue.length; i++) {
		if (socket.downloadQueue[i].id == id) {
			exists = socket.downloadQueue[i].queueId;
		}
	}
	if (socket.currentItem && (socket.currentItem.id == id)) {
		exists = socket.currentItem.queueId;
	}
	return exists;
}

// Exporting vars
module.exports.defaultSettings = userSettings.read()
module.exports.defaultDownloadDir = paths.defaultDownload
