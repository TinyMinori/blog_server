const express = require('express')
const router = express.Router()

const User = require('../controllers/User')
const AccessToken = require('../modules/AccessToken')
const Rules = require('../modules/Rules')

/* [POST] Register a new user */
router.post('/register', Rules.canRegister, User.register, AccessToken.create)

/* [POST] Login a user */
router.post('/login', Rules.canLogin, User.login, AccessToken.create)

/* [GET] Get profile data */
router.get('/me', AccessToken.verify, User.findById)

/* [PUT] Update the profile data */
router.put('/me', Rules.canUpdate, AccessToken.verify, User.update)

/* [DELETE] Remove a user */
router.delete('/me', AccessToken.verify, User.delete)

/* [POST] Become a publisher */
router.post('/publisher', Rules.canBePublisher, AccessToken.verify, User.goPublisher)

/* [POST] Make another user a publisher */
router.post('/publisher/:id', Rules.canMakePublisher, AccessToken.verify, User.makePublisher)

module.exports = router