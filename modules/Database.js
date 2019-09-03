const mongoose = require('mongoose')

module.exports = class Database {
	constructor(uri) {
		this.uri = process.env.MONGODB_URI || uri
		this.options = {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false
		}
	}

	async connect() {
		return new Promise(async (resolve, reject) => {
			try {
				await mongoose.connect(this.uri, this.options)
			} catch (error) {
				reject(error.message)
				return
			}
			resolve()
		})
	}
}