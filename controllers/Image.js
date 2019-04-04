const Image = require('../models/Image')
const User = require('../models/User')

exports.findByPage = async (req, res) => {
	console.log(req.body);
	await Image.find({}).sort({date: 'desc'}).limit(10).exec()
	.then((images) => {
		if (!images)
			return res.status(404).send({
				message: 'Images not found'
			})
		res.status(200).send({
			data: images
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while searching Images'
		})
	})
}

exports.save = (req, res) => {
	if (!req.file)
		return res.status(400).send({
			message: 'No Image sent'
		})
	
	let image = Image({
		location_img: req.file.filename,
		description: req.body.content || '',
		date: new Date(Date.now()),
		comments: []
	})
	
	image.save()
	.then((img) => {
		if (!img)
			return res.status(404).send({
				message: 'Image can\'t be saved'
			})
		if 
	}).catch(() => {

	})
	console.log(req.file.filename)
	res.status(200).send("goot")
}

exports.update = (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	res.status(200).send("goot")
}

exports.delete = (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	res.status(200).send("goot")
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
			message: 'User updated'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while searching User'
		})
	})
}