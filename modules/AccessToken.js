const jwt = require('jsonwebtoken')
const User = require('../models/User')

const timeout = 3600

const config = {
	secret: 'supersecret'
}

exports.create = (req, res) => {
	if (!req.body.id)
		return res.status(500).send({
			message: 'User Id not Found'
		})
	var token = jwt.sign({ id: req.body.id }, config.secret, {
		expiresIn: timeout
	})
	res.status(200).send({
		token: 'Bearer ' + token
	})
}

exports.verify = (req, res, next) => {
	let token = req.headers['authorization']

	req.user = {}
	if (!token)
		return res.status(400).send({
			message: 'Authorization header not set'
		})
	let data = token.split(' ')
	if (data[0] !== 'Bearer')
		return res.status(400).send({
			message: 'Authorization header not correctly set'
		})

	if (!data[1])
		return res.status(401).send({
			message: 'No token provided'
		})

	jwt.verify(data[1], config.secret, (err, decoded) => {
		if (err) {
			return res.status(500).send({
				message: 'Failed to authenticate token'
			})
		}
		req.user.id = decoded.id
		next()
	})
}