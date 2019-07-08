const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')
const http = require('http')
const database = require('./modules/Database')
const cors = require('cors')
const aws = require('./modules/FileService')
const fileUpload = require('express-fileupload');

/**
 * Setup the database
 */

const db = new database()
db.connect()

/**
 * Setup the FileService
 */

aws.connect()

/**
 * Setup the router
 */
const app = express()

// default options
app.use(fileUpload());

app.use(logger('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())
app.use('/images', express.static(__dirname + '/images'))

/**
 * Allowed Methods, Headers and Origins (CORS)
 */
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Forwarded-For")
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE")
	next()
})

/**
 *  Setup routes
 */
const userRoutes = require('./routes/User')
const imageRoutes = require('./routes/Image')
const commentRoutes = require('./routes/Comment')

app.use('/', userRoutes)
app.use('/', imageRoutes)
app.use('/', commentRoutes)

/**
 * Default route if none has been found
 */
app.use((req, res) => {
	res.status(404).send({
		message: "Not Found"
	})
})

/**
 * Create HTTP server.
 */

var server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

let port = 3001
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

function onListening() {
  console.log('[Server] Listening on localhost:' + port)
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}