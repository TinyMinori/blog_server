const Image = require('../models/Image')
const User = require('../models/User')
const { removeFile, uploadFile } = require('../modules/FileService')

exports.findByPage = async (req, res) => {
	if (!req.query.page || req.query.page <= 0)
		req.query.page = 0
	else
		req.query.page = req.query.page - 1
	let limit = 10
	await Image.find({}).sort({date: 'desc'}).exec()
	.then((images) => {
		if (!images)
			return res.status(404).send({
				message: 'Images not found'
			})
		let cursor = limit * req.query.page
		let result = []
		for (let index = 0; index < limit && (index + cursor) < images.length; index++)
			result.push(images[index + cursor])
		res.status(200).send({
			data: result
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while searching Images'
		})
	})
}

exports.save = async (req, res) => {
	let file = req.files.image
	await uploadFile({ Body: file.data, ContentType: file.mimetype })
	.then(data =>
		Image({
			location: data.Location,
			content: req.body.content || '',
			comments: []
		}).save()
	).then(img => {
		if (!img)
			return res.status(404).send({
				message: 'Image can\'t be saved'
			})
		res.status(200).send({
			message: 'Image saved'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while saving Image'
		})
	})
}

exports.update = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})

	let data = {}
	if (req.query.replace == 'needed') {
		if (req.file && req.file.filename)
			data.location = req.file.filename
		if (req.body.content)
			data.content = req.body.content
		if (req.file && req.file.filename || req.body.content)
			data.date = Date.now()
	} else if (req.query.replace == 'all') {
		if (req.file)
			data.location = req.file.filename
		else
			data.location = ''
		data.content = req.body.content || ''
		data.date = Date.now()
	}

	await Image.findByIdAndUpdate(req.params.img_id, {$set: data}).exec()
	.then((image) => {
		if (!image)
			return res.status(404).send({
				message: 'Image not found'
			})
		if (image.location && req.query.replace == 'all' ||
			data.location && image.location)
			removeFile(image.location)
		res.status(200).send({
			message: 'Image updated'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while updating Image'
		})
	})
}

exports.delete = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	await Image.findByIdAndRemove(req.params.img_id)
	.then((image) => {
		if (!image)
			return res.status(404).send({
				message: 'Image not found'
			})
		if (image.location != '')
			removeFile(image.location)
		return res.status(200).send({
			message: 'Image #' + image._id + ' removed'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while removing Image'
		})
	})
}

exports.favorite = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	let img_id = req.params.img_id
	await Image.findById(img_id).exec()
	.then((image) => {
		if (!image)
			return res.status(404).send({
				message: 'Image not found'
			})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while searching Image'
		})
	})
	await User.findById(req.user.id).exec()
	.then((user) => {
		if (!user)
			return res.status(404).send({
				message: 'User not found'
			})
		let favorites = user.favorite
		(favorites.includes(img_id)) ?
			favorites.push(img_id) : favorites.splice(favorites.indexOf(img_id), 1)
		user.favorite = favorites
		user.save()
		res.status(200).send({
			message: 'User favorite updated'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while searching User'
		})
	})
}