const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');

var ObjectId = mongoose.Schema.Types.ObjectId

var Image = new mongoose.Schema({
	location: String,
	key: String,
	content: String,
	date: {
		type: Date,
		default: Date.now,
		required: true
	},
	comments: {
		type: [ObjectId],
		default: []
	}
})

Image.plugin(mongoosePaginate)

module.exports = mongoose.model('Image', Image)