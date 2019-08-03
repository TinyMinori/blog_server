const Card = require('../models/Card')
const Image = require('../models/Image') 
const { removeFile, uploadFile } = require('../modules/FileService')

exports.findByPage = async (req, res) => {
	if (!req.query.page || req.query.page < 1)
		req.query.page = 1
	let options = {
		limit: 10,
		sort: { date: 'desc' },
		populate: { path: 'images', select: { '__v': 0 } },
		select: { '__v': 0 },
		page: req.query.page
	}
	Card.paginate({}, options)
	.then(result => {
		if (!result)
			return res.status(404).send({
				message: 'Card not found'
			})
		res.status(200).send({
			data: result.docs
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while searching Card'
		})
	})
}

exports.save = async (req, res) => {
	let files = req.files && Object.keys(req.files).length > 0 ? req.files : undefined

	let pImages = []	
	if (files !== undefined)
		pImages = Object.keys(files).map((key) => {
			return uploadFile({ Body: files[key].data, ContentType: files[key].mimetype })
			.then(img => new Image({
					key: img.Key,
					location: img.Location
				}).save()
			)
		})
	Promise.all(pImages)
	.then(imgs => {
		return new Card({
			title: req.body.title || '',
			content: req.body.content || '',
			images: imgs || []
		}).save()
		.then((card) => {
			if (!card)
				return res.status(404).send({
					message: 'Card can\'t be saved'
				})
			res.status(200).send({
				message: 'Card saved'
			})
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while saving Card'
		})
	})
}

exports.update = async (req, res) => {
	if (!req.params.card_id)
		return res.status(400).send({
			message: 'No card id specified'
		})
	let file = req.files ? req.files.image : undefined
	let data = {}
	if (req.body.content)
		data.content = req.body.content
	if (file || req.body.content)
		data.date = Date.now()

	await Card.findByIdAndUpdate(req.params.card_id, {$set: data}).exec()
	.then(async (card) => {
		if (!card)
			return res.status(404).send({
				message: 'Element not found'
			})
		if (file) {
			await removeFile(card.key)
			return uploadFile({ Body: file.data, ContentType: file.mimetype })
			.then((card) =>
				Card.findByIdAndUpdate(req.params.card_id, 
					{ $set: 
						{
							location: card.Location,
							key: card.Key
						}
					}).exec()
			)
		}
	}).then(() => {
		res.status(200).send({
			message: 'Element correctly updated'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while updating the Element'
		})
	})
}

exports.delete = async (req, res) => {
	if (!req.params.card_id)
		return res.status(400).send({
			message: 'No card id specified'
		})
	Card.findByIdAndRemove(req.params.card_id).populate('images').exec()
	.then(async(card) => {
		if (!card)
			return res.status(404).send({
				message: 'Card not found'
			})
		if (card.images.length !== 0) {
			let p = card.images.map(img => 
				Image.findByIdAndRemove({ _id: img._id}).exec()
				.then(img => removeFile(img.key))
			)
			await Promise.all(p)
		}
		return res.status(200).send({
			message: 'Card #' + card._id + ' removed'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while removing Card'
		})
	})
}

/*exports.favorite = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No element id specified'
		})
	let img_id = req.params.img_id
	await Card.findById(img_id).exec()
	.then((card) => {
		if (!card)
			return res.status(404).send({
				message: 'Element not found'
			})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while searching Element'
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
}*/