const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')
const http = require('http')
const database = require('./modules/Database')
const cors = require('cors')
const aws = require('./modules/FileService')
const fileUpload = require('express-fileupload')

/**
 * Setup the database
 */

const db = new database(process.env.MONGODB_URI)
db.connect()
.then(() => {
  console.log('[Database] Connected')
}).catch(error => {
  console.error('[Database] ' + error)
})

/**
 * Setup the FileService
 */
aws.connect()

/**
 * Setup the router
 */
const app = express()

// default options
app.use(fileUpload())
app.use(logger('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

/**
 * Allowed Methods, Headers and Origins (CORS)
 */
/*let allowedOrigins = ['localhost:3000']
if (process.env.PLATFORM_URL) allowedOrigins.push(process.env.PLATFORM_URL)*/

app.use(cors(/*{
  origin: function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1)
      callback(null, true)
    callback('Not allowed by CORS', false)
  },
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
  methods: 'POST,GET,PUT,DELETE',
}*/))

/*app.use(function (err, req, res, next) {
  if (err)
    console.log("error")
})*/

/**
 * Setup routes
 * Comment route is disabled for now [GDPR Law]
 */
const userRoutes = require('./routes/User')
const cardRoutes = require('./routes/Card')
//const commentRoutes = require('./routes/Comment')

app.use('/', userRoutes)
app.use('/', cardRoutes)
//app.use('/', commentRoutes)

/**
 * Default route if none has been found
 */
app.all('*', (req, res) => {
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

let port = process.env.PORT || 3000
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