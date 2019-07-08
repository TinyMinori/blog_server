const mongoose = require('mongoose')

var ObjectId = mongoose.Schema.Types.ObjectId

var Image = new mongoose.Schema({
	location: String,
	key: String,
	content: String,
	date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	comments: {
		type: [ObjectId]
	}
})

module.exports = mongoose.model('Image', Image)