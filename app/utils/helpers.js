const { userSettings } = require('../service/config')

const fixName = (txt) => {
  const regEx = /[\0\/\\:*?"<>|]/g
  return txt.replace(regEx, '_')
}

function antiDot(str) {
	while (str[str.length - 1] == "." || str[str.length - 1] == " " || str[str.length - 1] == '\n') {
		str = str.substring(0, str.length - 1)
	}
	if (str.length < 1) {
		str = 'dot'
	}
	return fixName(str)
}

/**
 * Creates the name of the tracks replacing wildcards to correct metadata
 * @param metadata
 * @param {string} filename
 * @param playlist
 * @returns {string|*}
 */
function settingsRegex(metadata, filename, playlist) {
	filename = filename.replace(/%title%/g, metadata.title);
	filename = filename.replace(/%album%/g, metadata.album);
	filename = filename.replace(/%artist%/g, metadata.artist);
	filename = filename.replace(/%year%/g, metadata.year);
	if (typeof metadata.trackNumber != 'undefined') {
		if (userSettings.read().padtrck) {
			 filename = filename.replace(/%number%/g, pad(splitNumber(metadata.trackNumber, false), splitNumber(metadata.trackNumber, true)));
		} else {
			filename = filename.replace(/%number%/g, splitNumber(metadata.trackNumber, false));
		}
	} else {
		filename = filename.replace(/%number%/g, '');
	}
	return filename;
}

/**
 * Creates the name of the albums folder replacing wildcards to correct metadata
 * @param metadata
 * @param {string} foldername
 * @returns {string}
 */
const settingsRegexAlbum = (metadata, foldername, artist, album) => {
  return foldername
    .replace(/%album%/g, album)
    .replace(/%artist%/g, artist)
    .replace(/%year%/g, metadata.year)
    .replace(/%type%/g, metadata.rtype)
}

/**
 * I really don't understand what this does ... but it does something
 * @param str
 * @param max
 * @returns {String|string|*}
 */
function pad(str, max) {
	str = str.toString();
	max = max.toString();
  console.log(`str: ${str}\nmax: ${max}\nresult: ${str.length < max.length || str.length == 1 ? pad("0" + str, max) : str}`)
	return str.length < max.length || str.length == 1 ? pad("0" + str, max) : str;
}

/**
 * Splits the %number%
 * @param {string} str
 * @return string
 */
function splitNumber(str, total) {
	str = str.toString();
	var i = str.indexOf("/");
	if (total && i > 0) {
		return str.slice(i + 1, str.length);
	} else if (i > 0) {
		return str.slice(0, i);
	} else {
		return str;
	}
}

module.exports = { fixName, antiDot, settingsRegex, settingsRegexAlbum, pad, splitNumber }
