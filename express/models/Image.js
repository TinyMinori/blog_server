const mongoose = require('mongoose')

var imageSchema = new mongoose.Schema({
	key: {
		type: String,
		require: true
	},
	location: {
		type: String,
		require: true
	}
})

module.exports = mongoose.model('Image', imageSchema)