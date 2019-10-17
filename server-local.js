'use strict';

const app = require('./express/server');

/**
 * Listen on provided port, on all network interfaces.
 */

let port = process.env.PORT || 3000
app.on('error', onError)

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

app.listen(port, () => {
  console.log('[Server] Listening on localhost:' + port)
})