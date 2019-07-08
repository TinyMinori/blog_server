const Image = require('../models/Image')
const User = require('../models/User')
const { removeFile, uploadFile } = require('../modules/FileService')

exports.findByPage = async (req, res) => {
	if (!req.params.page || req.params.page <= 0)
		req.query.page = 0
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
	.then(data => new Image({
			location: data.Location,
			key: data.Key,
			content: req.body.content || ''
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
	let file = req.files ? req.files.image : undefined
	let data = {}
	if (req.body.content)
		data.content = req.body.content
	if (file || req.body.content)
		data.date = Date.now()

	await Image.findByIdAndUpdate(req.params.img_id, {$set: data}).exec()
	.then(async (image) => {
		if (!image)
			return res.status(404).send({
				message: 'Image not found'
			})
		if (file) {
			await removeFile(image.key)
			await uploadFile({ Body: file.data, ContentType: file.mimetype })
			.then((image) =>
				Image.findByIdAndUpdate(req.params.img_id, 
					{ $set: 
						{
							location: image.Location,
							key: image.Key
						}
					}).exec()
			).catch(err => res.status(500).send({
				message: err.message || 'Some error occurred while updating Image'
			})
			)
		}
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
	.then(async (image) => {
		if (!image)
			return res.status(404).send({
				message: 'Image not found'
			})
		if (image.key !== '')
			await removeFile(image.key)
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