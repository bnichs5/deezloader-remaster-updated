// @ts-check

const crypto = require('crypto')

const ekey = "DeezLadRebExtLrdDeezLadRebExtLrd"

const encrypt = (input) => {
	let iv = crypto.randomBytes(16)
	let data = new Buffer(input).toString('binary')
	let key = new Buffer(ekey, "utf8")
	let cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
	let encrypted = cipher.update(data, 'utf8', 'binary') +  cipher.final('binary')
	let encoded = new Buffer(iv, 'binary').toString('hex') + new Buffer(encrypted, 'binary').toString('hex')
	return encoded
}

const decrypt = (encoded) => {
	var combined = new Buffer(encoded, 'hex')
	let key = new Buffer(ekey, "utf8")
	var iv = new Buffer(16)
	combined.copy(iv, 0, 0, 16)
	let edata = combined.slice(16).toString('binary')
	let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
	let decrypted, plaintext
	plaintext = (decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8'));
	return plaintext;
}

module.exports = { encrypt, decrypt }
