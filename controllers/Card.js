const Card = require('../models/Card')
const Image = require('../models/Image')
const ObjectId = require('mongoose').Types.ObjectId
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

/**
 * Add Order obligatory
 */
exports.save = async (req, res) => {
	/**
	 * Check data sent by user
	 */
	let files = req.files && Object.keys(req.files).length > 0 ? req.files : {}

	if (req.body.order !== undefined && req.body.order.trim().length !== 0) {
		try {
			req.body.order = JSON.parse(req.body.order)
			if (!Array.isArray(req.body.order)) throw new Error('order isn\'t an array')
			if (req.body.order.length !== Object.keys(req.files).length) throw new Error('order doesn\'t match the length of files sent')
			req.body.order = req.body.order.reduce((previousValue, currentValue) => {
				if (previousValue.includes(currentValue)) return [...previousValue, undefined]
				return [...previousValue, currentValue]
			}, [])
		} catch (e) {
			return res.status(400).send({
				message: 'Order can\'t be parsed',
				error: e.message
			})
		}
	} else {
		if (Object.keys(files).length > 0)
			return res.status(404).send({
				message: 'Order is mandatory'
			})
		else req.body.order = []
	}

	let imgList = req.body.order.map(key => {
		if (key === undefined) return undefined
		return files[key]
	})

	if (imgList.some(item => item === undefined))
		return res.status(404).send({
			message: 'Order contains unknown image name or duplicate'
		})
	
	/**
	 * Compute Promises
	 */

	let pImages = imgList.map(item => {
		return new Promise((resolve, reject) => {
			uploadFile({ Body: item.data, ContentType: item.mimetype })
			.then(img => {
				return new Image({
					key: img.Key,
					location: img.Location
				}).save()
			})
			.then(imgData => resolve(imgData))
			.catch(error => reject(error))
		})
	})

	Promise.all(pImages)
	.then(imgs => new Card({
			title: req.body.title,
			content: req.body.content,
			images: imgs
		}).save()
	).then(card => {
		if (!card)
			return res.status(500).send({
				message: 'Card can\'t be saved'
			})
		res.status(200).send({
			message: 'Card saved'
		})
	}).catch(error => {
		return res.status(500).send({
			message: error.message || 'Some error occurred while saving Card'
		})
	})
}

exports.update = async (req, res) => {
	/**
	 * Check data sent by the user
	 */
	if (!req.params.card_id)
		return res.status(400).send({
			message: 'No card id specified'
		})
		
	let currentCard = undefined
	
	try {
		currentCard = await Card.findById(req.params.card_id).populate('images').exec()
		currentCard.images = currentCard.images.map(item => item._id)
	} catch (err) {
		return res.status(404).send({
			message: "Card id #" + req.params.card_id + " not found",
			error: err.message
		})
	}

	let files = req.files && Object.keys(req.files).length > 0 ? req.files : {}

	if (req.body.order !== undefined && req.body.order.trim().length !== 0) {
		try {
			req.body.order = JSON.parse(req.body.order)
			if (!Array.isArray(req.body.order)) throw new Error('order isn\'t an array')
			req.body.order = req.body.order.reduce((previousValue, currentValue) => {
				if (previousValue.includes(currentValue)) return [...previousValue, undefined]
				return [...previousValue, currentValue]
			}, [])
		} catch (e) {
			return res.status(400).send({
				message: 'Order can\'t be parsed',
				error: e.message
			})
		}
	} else req.body.order = []

	let imgList = req.body.order
		.map(id => {
			if (id === undefined) return undefined
			if (files[id] === undefined)
				return (currentCard.images.includes(id) ? id : undefined)
			return files[id]
		})

	if (imgList.some(data => data === undefined))
		return res.status(404).send({
			message: 'Order contains unknown image id, name or has duplicate'
		})

	let deleteImg = currentCard.images
		.map(id => (req.body.order.includes(id) ? undefined : id))
		.filter(id => id !== undefined)

	/**
	 * Compute Promises
	 */

	let pImages = Object.keys(files).map(key => {
		return new Promise((resolve, reject) => {
			uploadFile({ Body: files[key].data, ContentType: files[key].mimetype })
			.then(img => {
				return new Image({
					key: img.Key,
					location: img.Location
				}).save()
			})
			.then(imgData => resolve({id: imgData._id, name: key}))
			.catch(error => reject(error))
		})
	})

	let pDelete = deleteImg.map(id => {
		return new Promise((resolve, reject) => {
			Image.findByIdAndRemove(id).exec()
			.then(item => removeFile(item.key))
			.then(() => resolve())
			.catch(() => reject())
		})
	})

	Promise.all(pDelete)
	.then(() => {
		return Promise.all(pImages)
	}).then(imagesSaved => {
		let images = req.body.order.map(key => {
			if (currentCard.images.includes(key))
				return key
			let imgData = imagesSaved.map(img => (img.name === key ? img.id : undefined)).filter(id => id !== undefined)
			if (imgData.length >= 1) return imgData[0]
			return undefined
		}).filter(id => id !== undefined)

		let data = {
			title: req.body.title,
			content: req.body.content,
			images
		}

		return Card.findByIdAndUpdate(req.params.card_id, {$set: data}).exec()
	}).then(card => {
		if (!card)
			res.status(500).send({
				message: 'Card can\'t be update'
			})
		res.status(200).send({
			message: 'Card updated'
		})
	}).catch(error => {
		return res.status(500).send({
			message: error.message || 'Some error occurred while saving Card'
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