const Comment = require('../models/Comment')
const User = require('../models/User')

exports.findByImgId = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	
	await Comment.find({id_image: req.params.img_id})
	.then((comments) => {
		if (!comments)
			return res.status(404).send({
				message: 'Comment not found'
			})
		res.status(200).send({
			data: comments
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while finding Comments'
		})
	})
}

exports.save = async (req, res) => {
	if (!req.params.img_id)
		return res.status(400).send({
			message: 'No image id specified'
		})
	if (!req.body.content)
		return res.status(400).send({
			message: 'No content specified'
		})
	let comment = new Comment({
		id_image: req.params.img_id,
		id_author: req.user.id,
		content: req.body.content,
		date: new Date(Date.now())
	})
	await comment.save()
	.then((comment) => {
		if (!comment) {
			return res.status(404).send({
				message: 'Comment not found'
			})
		}
		res.status(200).send({
			message: 'Comment correctly added'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while creating Comment'
		})
	})
}

exports.update = async (req, res) => {
	if (!req.params.cmnt_id)
		return res.status(400).send({
			message: 'No comment id specified'
		})
	if (!req.body.content)
		return res.status(400).send({
			message: 'No content specified'
		})
	await Comment.findByIdAndUpdate(req.params.cmnt_id, {$set: {content: req.body.content}})
	.then((comment) => {
		if (!comment) {
			return res.status(404).send({
				message: 'Comment not found'
			})
		}
		res.status(200).send({
			message: 'Comment correctly updated'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while updating Comment'
		})
	})
}

exports.delete = async(req, res) => {
	if (!req.params.cmnt_id)
		return res.status(400).send({
			message: 'No comment id specified'
		})
	await Comment.findByIdAndDelete(req.params.cmnt_id)
	.then((comment) => {
		if (!comment) {
			return res.status(404).send({
				message: 'Comment not found'
			})
		}
		res.status(200).send({
			message: 'Comment deleted'
		})
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while deleting Comment'
		})
	})
}