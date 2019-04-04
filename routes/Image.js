const express = require('express')
const router = express.Router()

const Image = require('../controllers/Image')
const AccessToken = require('../modules/AccessToken')

const { multer } = require('../modules/FileService')

/* [GET] Return a gallery [order by page] */
router.get('/gallery', Image.findByPage)

/* [POST] Post image */
router.post('/image', AccessToken.verify, multer.single('image'), Image.save)

/* [PUT] Edit image with id 'img_id' */
router.put('/image/:img_id', AccessToken.verify, multer.single('image'), Image.update)

/* [DELETE] Remove image with id 'img_id' */
router.delete('/image/:img_id', AccessToken.verify, Image.delete)

/* [POST] Like or unlike image with id 'img_id' */
router.post('/image/:img_id/favorite', AccessToken.verify, Image.favorite)

module.exports = router