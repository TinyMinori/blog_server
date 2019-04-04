const express = require('express')
const router = express.Router()

const User = require('../controllers/User')
const AccessToken = require('../modules/AccessToken')

/* [POST] Register a new user */
router.post('/register', User.register, AccessToken.create)

/* [POST] Login a user */
router.post('/login', User.login, AccessToken.create)

/* [GET] Get profile data */
router.get('/me', AccessToken.verify, User.findById)

/* [PUT] Update the profile data */
router.put('/me', AccessToken.verify, User.update)

/* [DELETE] Remove a user */
router.delete('/me', AccessToken.verify, User.delete)

/* [POST] Become a publisher */
router.post('/publisher', AccessToken.verify, User.goPublisher)

module.exports = router