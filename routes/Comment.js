const express = require('express')
const router = express.Router()

const Comment = require('../controllers/Comment')
const AccessToken = require('../modules/AccessToken')

/* [GET] List comments of image with id 'img_id' */
router.get('/comments/:img_id', Comment.findByImgId)

/* [POST] Post a comment under image with id 'img_id' */
router.post('/comment/:img_id', AccessToken.verify, Comment.save)

/* [PUT] Edit comment with id 'cmnt_id' */
router.put('/comment/:cmnt_id', AccessToken.verify, Comment.update)

/* [DELETE] Remove comment with id 'cmnt_id' */
router.delete('/comment/:cmnt_id', AccessToken.verify, Comment.delete)

module.exports = router