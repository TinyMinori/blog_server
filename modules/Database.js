const mongoose = require('mongoose')

function uri_format(db_class) {
	let res = 'mongodb://'
	if (db_class.user !== undefined && db_class.password !== undefined) {
		res += db_class.user + ':' + db_class.password + '@'
		db_class.options.auth = { authdb: "admin"}
	}
	res += db_class.host + ':' + db_class.port
	if (db_class.db !== undefined)
		res += '/' + db_class.db
	return res	
}

module.exports = class Database {
	constructor(url) {
		this.url = url || undefined
		this.host = 'localhost'
		this.port = 27017
		this.user = undefined
		this.password = undefined
		this.db = 'traveler'
		this.options = {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false
		}
	}

	async connect() {
		return new Promise((resolve, reject) => {
			mongoose.connect(this.url || uri_format(this), this.options)
			var state = mongoose.connection
			state.on('error', function () {
				console.error('[Database] Connection Failed')
				reject()
			})
			state.on('open', function () {
				console.log('[Database] Connected')
				resolve()
			})
		})
	}
}