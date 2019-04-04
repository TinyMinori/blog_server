var mongoose = require('mongoose')

var ObjectId = mongoose.Schema.Types.ObjectId

var Comment = new mongoose.Schema({
	id_image: {
		type: ObjectId,
		required: true
	},
	id_author: {
		type: ObjectId,
		required: true
	},
	content: {
		type: String,
		required: true,
		maxlength: 125
	},
	date: {
		type: Date,
		required: true
	}
})

module.exports = mongoose.model('Comment', Comment)