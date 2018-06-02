// @ts-check

// const NRrequest = require('request');
/** @type {*} */
const request = require('requestretry').defaults({maxAttempts: 3, retryDelay: 500, timeout: 5000});
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { settings, userSettings } = require('./config')
const logger = require('./logger')

class Deezer {
  constructor() {
    this.userId = null
    this.apiUrl = 'http://www.deezer.com/ajax/gw-light.php'
    this.apiQueries = {
      api_version: '1.0',
      api_token: 'null',
      input: '3'
    }
    this.httpHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36',
      'Content-Language': 'en-US',
      'Cache-Control': 'max-age=0',
      'Accept': '*/*',
      'Accept-Charset': 'utf-8,ISO-8859-1;q=0.7,*;q=0.3',
      'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4'
    }
    this.albumPicturesHost = 'https://e-cdns-images.dzcdn.net/images/cover/'
    this.reqStream = null
	}
	init(username, password) {
		 return init(username, password)
	}
	getMyPlaylists() {
		return getMyPlaylists()
	}
	getPlaylist(id) {
		return getPlaylist(id)
	}
	getAlbum(id, callback) {
		return getAlbum(id, callback)
	}
	getAlbumPromise(id) {
		return getAlbumPromise(id)
	}
	getArtist(id, callback) {
		return getArtist(id, callback)
	}
	getArtistAlbums(id, callback) {
		return getArtistAlbums(id, callback)
	}
	getTrack(id, callback) {
		return getTrack(id, callback)
	}
	getATrack(id, callback) {
		return getATrack(id, callback)
	}
	getDownloadUrl(md5Origin, id, format, mediaVersion) {
		return getDownloadUrl(md5Origin, id, format, mediaVersion)
	}
	getChartsTopCountry(callback) {
		return getChartsTopCountry(callback)
	}
	hasTrackAlternative(id, callback) {
		return hasTrackAlternative(id, callback)
	}
	search(text, type, callback) {
		return search(text, type, callback)
	}
	decryptTrack(writePath, track, callback) {
		return decryptTrack(writePath, track, callback)
	}
	cancelDecryptTrack() {
		return cancelDecryptTrack()
	}
	onDownloadProgress(track, progress) {
		return onDownloadProgress(track, progress)
	}
}

const deezer = new Deezer()

function DeezerOld() {
	deezer.userId = null;
	deezer.apiUrl = 'http://www.deezer.com/ajax/gw-light.php';
	deezer.apiQueries = {
		api_version: '1.0',
		api_token: 'null',
		input: '3'
	};
	deezer.httpHeaders = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36',
		'Content-Language': 'en-US',
		'Cache-Control': 'max-age=0',
		'Accept': '*/*',
		'Accept-Charset': 'utf-8,ISO-8859-1;q=0.7,*;q=0.3',
		'Accept-Language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4'
	}
	deezer.albumPicturesHost = 'https://e-cdns-images.dzcdn.net/images/cover/'
	deezer.reqStream = null;
}

const init = (username, password) => {
	return new Promise((resolve, reject) => {
		request.post({
			url: 'https://www.deezer.com/ajax/action.php',
			headers: deezer.httpHeaders,
			form: {
				type:'login',
				mail:username,
				password:password
			},
			jar: true,
		})
			.then(res => {
				if (res.statusCode !== 200) throw new Error('Unable to load deezer.com.')
				if (res.body.indexOf('success') == -1) throw new Error('Incorrect email or password.')
				getToken().then(() => resolve()).catch(e => reject(e))
			})
			.catch(e => reject(e))
	})
}

const getToken = () => {
	return new Promise((resolve, reject) => {
		request.get({
			url: 'https://www.deezer.com/',
			headers: deezer.httpHeaders,
			jar: true
		})
			.then(res => {
				if (res.statusCode !== 200) throw new Error('Unable to load deezer.com 1')
				const regex = new RegExp(/"api_key":"([^",]*)/g)
				const _token = regex.exec(res.body)
				if (!(_token instanceof Array) || !_token[1]) throw new Error('Invalid token.')
				deezer.apiQueries.api_token = _token[1]
				logger.info(`New token API fetched from Deezer.`)
				const userRegex = new RegExp(/{"USER_ID":"([^",]*)/g)
				const userId = userRegex.exec(res.body)[1]
				deezer.userId = userId
				return resolve()
			})
			.catch(e => reject(e))
	})
}

const getMyPlaylists = function() {
	return getJSONPromise(`https://api.deezer.com/user/${deezer.userId}/playlists?limit=-1`)
}

const getPlaylist = function(id) {
	return getJSONPromise(`https://api.deezer.com/playlist/${id}?limit=-1`)
}

const getAlbum = function(id, callback) {
	getJSON(`https://api.deezer.com/album/${id}`, function(res){
		if (!(res instanceof Error)){
			callback(res);
		} else {
			callback(null, res)
		}
	});
}

const getAlbumPromise = function(id) {
	return getJSONPromise(`https://api.deezer.com/album/${id}?limit=-1`)
}

const getArtist = function(id, callback) {
	getJSON(`https://api.deezer.com/artist/${id}`, function(res){
		if (!(res instanceof Error)){
			callback(res);
		} else {
			callback(null, res)
		}
	});
}

const getArtistAlbums = function(id, callback) {
	getJSON(`https://api.deezer.com/artist/${id}` + '/albums?limit=-1', function(res){
		if (!(res instanceof Error)){
			if(!res.data) {
				res.data = [];
			}
			callback(res);
		} else {
			callback(null, res)
		}
	});
}

const getTrack = function(id, callback) {
	var scopedid = id;
	request.get({url: `https://www.deezer.com/track/${id}`, headers: deezer.httpHeaders, jar: true}, (function(err, res, body) {
		var regex = new RegExp(/<script>window\.__DZR_APP_STATE__ = (.*)<\/script>/g);
		var rexec = regex.exec(body);
		var _data;
		try{
			_data = rexec[1];
		}catch(e){
			if(deezer.apiQueries.api_token != 'null'){
				request.post({url: deezer.apiUrl, headers: deezer.httpHeaders, qs: deezer.apiQueries, body: "[{\"method\":\"song.getListData\",\"params\":{\"sng_ids\":[" + scopedid + "]}}]", jar: true}, (function(err, res, body) {
					if(!err && res.statusCode == 200) {
						try{
							var json = JSON.parse(body)[0].results.data[0];
							if(json['TOKEN']) {
								callback(new Error('Uploaded Files are currently not supported'));
								return;
							}
							var id = json['SNG_ID'];
							var md5Origin = json['MD5_ORIGIN'];
							var format;
							if(userSettings.read().hifi && json['FILESIZE_FLAC'] > 0){
								format = 9;
							}else{
								format = 3;
								if(json['FILESIZE_MP3_320'] <= 0) {
									if(json['FILESIZE_MP3_256'] > 0) {
										format = 5;
									} else {
										format = 1;
									}
								}
							}
							json.format = format;
							var mediaVersion = parseInt(json['MEDIA_VERSION']);
							json.downloadUrl = deezer.getDownloadUrl(md5Origin, id, format, mediaVersion);
							callback(json);
						}catch(e){
							callback(new Error('Unable to get Track'));
							return;
						}
					} else {
						callback(new Error(`Unable to get Track ${id}`));
					}
				}));
			}else{
				callback(new Error('Unable to get Track'));
			}
			return;
		}
		if(!err && res.statusCode == 200 && typeof JSON.parse(_data)['DATA'] != 'undefined') {
			var json = JSON.parse(_data)['DATA'];
			var lyrics = JSON.parse(_data)['LYRICS'];
			if(lyrics){
				json['LYRICS_TEXT'] = lyrics['LYRICS_TEXT'];
				json['LYRICS_SYNC_JSON'] = lyrics['LYRICS_SYNC_JSON'];
				json['LYRICS_COPYRIGHTS'] = lyrics['LYRICS_COPYRIGHTS'];
				json['LYRICS_WRITERS'] = lyrics['LYRICS_WRITERS'];
			}
			if(json['TOKEN']) {
				callback(new Error('Uploaded Files are currently not supported'));
				return;
			}
			var id = json['SNG_ID'];
			var md5Origin = json['MD5_ORIGIN'];
			var format;
			if(userSettings.read().hifi && json['FILESIZE_FLAC'] > 0){
				format = 9;
			}else{
				format = 3;
				if(json['FILESIZE_MP3_320'] <= 0) {
					if(json['FILESIZE_MP3_256'] > 0) {
						format = 5;
					} else {
						format = 1;
					}
				}
			}
			json.format = format;
			var mediaVersion = parseInt(json['MEDIA_VERSION']);
			json.downloadUrl = deezer.getDownloadUrl(md5Origin, id, format, mediaVersion);
			deezer.getATrack(id,function(trckjson){
				json['BPM'] = trckjson['bpm'];
				callback(json);
			});
		} else {
			callback(new Error(`Unable to get Track ${id}`));
		}
	}));
}

const getATrack = function(id, callback) {
	getJSON(`https://api.deezer.com/track/${id}`, function(res){
		if (!(res instanceof Error)){
			callback(res);
		} else {
			callback(null, res)
		}
	});
}

const getDownloadUrl = function(md5Origin, id, format, mediaVersion) {
	var urlPart = md5Origin + '¤' + format + '¤' + id + '¤' + mediaVersion;
	var md5sum = crypto.createHash('md5');
	md5sum.update(new Buffer(urlPart, 'binary'));
	let md5val = md5sum.digest('hex');
	urlPart = md5val + '¤' + urlPart + '¤';
	var cipher = crypto.createCipheriv('aes-128-ecb', new Buffer('jo6aey6haid2Teih'), new Buffer(''));
	var buffer = Buffer.concat([cipher.update(urlPart, 'binary'), cipher.final()]);
	return 'https://e-cdns-proxy-' + md5Origin.substring(0, 1) + '.dzcdn.net/mobile/1/' + buffer.toString('hex').toLowerCase();
}

const getChartsTopCountry = function(callback) {
	getJSON('https://api.deezer.com/user/637006841/playlists?limit=-1', function(res){
		if (!(res instanceof Error)){
			if(!res.data) {
				res.data = [];
			} else {
				//Remove 'Loved Tracks'
				res.data.shift();
			}
			callback(res);
		} else {
			callback(null, res)
		}
	});
}

const search = function(text, type, callback) {
	if(typeof type === 'function') {
		callback = type;
		type = '';
	} else {
		type += '?';
	}

	request.get({url: 'https://api.deezer.com/search/' + type + 'q=' + text, headers: deezer.httpHeaders, jar: true}, function(err, res, body) {
		if(!err && res.statusCode == 200) {
			var json = JSON.parse(body);
			if(json.error) {
				callback(null, new Error('Wrong search type/text: ' + text));
				return;
			}
			callback(json);
		} else {
			callback(null, new Error('Unable to reach Deezer API'));
		}
	});
}

const hasTrackAlternative = function(id, callback) {
	var scopedid = id;
	request.get({url: `https://www.deezer.com/track/${id}`, headers: deezer.httpHeaders, jar: true}, (function(err, res, body) {
		var regex = new RegExp(/<script>window\.__DZR_APP_STATE__ = (.*)<\/script>/g);
		var rexec = regex.exec(body);
		var _data;
		try{
			_data = rexec[1];
		}catch(e){
			callback(null, new Error('Unable to get Track ' + scopedid));
		}
		if(!err && res.statusCode == 200 && typeof JSON.parse(_data)['DATA'] != 'undefined') {
			var json = JSON.parse(_data)['DATA'];
			if(json.FALLBACK){
				callback(json.FALLBACK);
			}else{
				callback(null, new Error('Unable to get Track ' + scopedid));
			}
		} else {
			callback(null, new Error('Unable to get Track ' + scopedid));
		}
	}));
}

const decryptTrack = function(writePath, track, callback) {
	var chunkLength = 0;
	deezer.reqStream = request.get({url: track.downloadUrl, headers: deezer.httpHeaders, jar: true, encoding: null}, function(err, res, body) {
		if(!err && res.statusCode == 200) {
			var decryptedSource = decryptDownload(new Buffer(body, 'binary'), track);
			fs.outputFile(writePath,decryptedSource,function(err){
				if(err){callback(err);return;}
				callback();
			});
		} else {
			logger.error('Decryption error.')
			callback(err || new Error(`Can't download the track`));
		}
	}).on('data', function(data) {
		chunkLength += data.length;
		deezer.onDownloadProgress(track, chunkLength);
	}).on('abort', function() {
		logger.error('Decryption aborted.')
		callback(new Error('aborted'));
	});
}

const cancelDecryptTrack = function() {
	if(deezer.reqStream) {
		deezer.reqStream.abort();
		deezer.reqStream = null;
		return true;
	} else {
		false;
	}
}

const onDownloadProgress = function(track, progress) {
	return;
}

function decryptDownload(source, track) {
	var chunk_size = 2048;
	var part_size = 0x1800;
	var blowFishKey = getBlowfishKey(track['SNG_ID']);
	var i = 0;
	var position = 0;

	var destBuffer = new Buffer(source.length);
	destBuffer.fill(0);

	while(position < source.length) {
		var chunk;
		if ((source.length - position) >= 2048) {
			chunk_size = 2048;
		} else {
			chunk_size = source.length - position;
		}
		chunk = new Buffer(chunk_size);
		chunk.fill(0);
		source.copy(chunk, 0, position, position + chunk_size);
		if(i % 3 > 0 || chunk_size < 2048){
			//Do nothing
		}else{
			var cipher = crypto.createDecipheriv('bf-cbc', blowFishKey, new Buffer([0, 1, 2, 3, 4, 5, 6, 7]));
			cipher.setAutoPadding(false);
			chunk = cipher.update(chunk, 'binary', 'binary') + cipher.final();
		}
		destBuffer.write(chunk.toString('binary'), position, 'binary');
		position += chunk_size
		i++;
	}
	return destBuffer;
}

function getBlowfishKey(trackInfos) {
	const SECRET = 'g4el58wc0zvf9na1';

	const idMd5 = crypto.createHash('md5').update(trackInfos.toString(), 'ascii').digest('hex');
	let bfKey = '';

	for (let i = 0; i < 16; i++) {
		bfKey += String.fromCharCode(idMd5.charCodeAt(i) ^ idMd5.charCodeAt(i + 16) ^ SECRET.charCodeAt(i));
	}

	return bfKey;
}

function getJSON(url, callback){
	request.get({url: url, headers: deezer.httpHeaders, jar: true}, function(err, res, body) {
		if(err || res.statusCode != 200 || !body) {
			logger.error('Unable to initialize Deezer API.')
			callback(new Error());
		} else {
			var json = JSON.parse(body);
			if (json.error) {
				logger.error('Wrong id.', {error: json.error})
				callback(new Error());
				return;
			}
			callback(json);
		}
	});
}

function getJSONPromise(url) {
	return new Promise((resolve, reject) => {
			request.get({
				url: url,
				headers: deezer.httpHeaders,
				jar: true
			})
		.then(res => {
			if(res.statusCode != 200 || !res.body) throw new Error('Unable to initialize Deezer API.')
			var json = JSON.parse(res.body);
			if (json.error) {
				logger.error('Wrong id.', {error: json.error})
				throw new Error('Wrong id.')
			}
			resolve(json)
		})
		.catch(e => reject(e))
	})
}

module.exports = deezer
