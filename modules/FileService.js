const multer = require('multer')
const path = require('path')
const fs = require('fs')

const dest = 'images/'

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    req.body = {}
    let filename = Date.now() + path.extname(file.originalname)
    cb(null, filename)
  }
})

exports.removeFile = (filename) => {
  fs.stat(dest + filename, function (err) {
    if (err) {
      console.log('File doesn\'t exist')
      return
    }
    fs.unlink(dest + filename, function (err) {
      if (err) throw err;
      console.log('File deleted!');
    })
  })
}

exports.multer = multer({storage: storage})