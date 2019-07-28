const mongoose = require('mongoose')

var ObjectId = mongoose.Schema.Types.ObjectId

var User = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	favorite: {
		type: [ObjectId]
	},
	role: {
		type: String,
		enum: ['publisher', 'visitor'],
		default: 'visitor',
		required: true
	}
})

module.exports = mongoose.model('User', User)