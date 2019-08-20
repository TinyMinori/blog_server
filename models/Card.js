const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

var ObjectId = mongoose.Schema.Types.ObjectId

var cardSchema = new mongoose.Schema({
	content: {
		type: String,
		default: null
	},
	title: {
		type: String,
		default: null
	},
	images: [{
		type: ObjectId,
		ref: 'Image'
	}],
	date: {
		type: Date,
		default: Date.now,
		required: true
	}
})

cardSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Card', cardSchema)