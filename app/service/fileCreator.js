/** @type{*} */
const ID3Writer = require('../lib/browser-id3-writer')
/** @type{*} */
const mflac = require('flac-metadata')
const fs = require('fs-extra')
const paths = require('../utils/paths')
const { splitNumber } = require('../utils/helpers')
const { userSettings } = require('./config')
const trackFormat = require('./trackFormat')

/**
 *
 * @param {object} track
 * @param {object} metadata
 * @param {string} tempPath
 * @param {string} writePath
 * @return {void}
 */
const fileCreator = (track, metadata, tempPath, writePath) => {
  if (trackFormat.isFLAC(track.format)) {
    return createFLAC(track, metadata, tempPath, writePath)
  } else {
    return createMP3(track, metadata, tempPath, writePath)
  }
}

/**
 *
 * @param {object} track
 * @param {object} metadata
 * @param {string} tempPath
 * @return {void}
 */
const createMP3 = (track, metadata, tempPath, writePath) => {
  const songBuffer = fs.readFileSync(tempPath);

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
  fs.writeFileSync(writePath, taggedSongBuffer)
  fs.remove(tempPath)
}

/**
 *
 * @param {object} track
 * @param {object} metadata
 * @param {string} tempPath
 * @return {void}
 */
const createFLAC = (track, metadata, tempPath, writePath) => {
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
}

module.exports = fileCreator
