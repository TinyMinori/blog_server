const multer = require('multer')
const path = require('path')

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

exports.removeFile = (filepath) => {
  fs.unlink(filepath, function (err) {
    if (err) throw err;
    console.log('File deleted!');
  })
}

exports.multer = multer({storage: storage})