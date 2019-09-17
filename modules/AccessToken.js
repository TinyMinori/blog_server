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

exports.isPublisher = (req, res, next) => {
	if (req.user.role === "publisher")
		next()
	res.status(404).send({
		message: 'You don\'t have the correct role to publish cards'
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
		User.findById(decoded.id, {__v: 0, password: 0, _id: 0})
		.then(user => {
			if (!user) {
				return res.status(404).send({
					message: 'User not found'
				})
			}
			req.user = { ...user._doc }
			req.user.id = decoded.id
			next()
		}).catch(err => {
			res.status(500).send({
				message: err.message || 'Some error occurred while finding the User'
			})
		})
	})
}