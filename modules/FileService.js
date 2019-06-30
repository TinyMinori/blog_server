const multer = require('multer')
const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
AWS.config.update({region: 'eu-west-3'})

const s3 = new AWS.S3()

var myBucket = 'quebec-travel'

exports.uploadFile = async(Body) => s3.putObject({ Bucket: myBucket, Body, Key: uuid() }).promise()

exports.removeFile = async(Key) => s3.deleteObject({ Bucket: myBucket, Key}).promise()

exports.connect = () => s3.createBucket({Bucket: myBucket}).promise().then(() => {
  console.log("[FileService] Bucket Created")
}).catch(err => {
  if (err.code !== "BucketAlreadyOwnedByYou") console.log(err)
  else console.log("[File Service] Connected")
})

exports.multer = require('multer')()