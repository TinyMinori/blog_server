const mongoose = require('mongoose')

var ObjectId = mongoose.Schema.Types.ObjectId

var Image = new mongoose.Schema({
	location_img: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	date: {
		type: Date,
		required: true
	},
	comments: {
		type: [ObjectId]
	}
})

module.exports = mongoose.model('Image', Image)