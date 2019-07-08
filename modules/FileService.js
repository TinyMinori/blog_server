const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
AWS.config.update({region: 'eu-west-3'})

const s3 = new AWS.S3()

var myBucket = 'quebec-travel'

exports.uploadFile = ({ Body, ContentType }) => s3.upload({
  Bucket: myBucket,
  Key: uuid(),
  Body,
  ContentType,
  ACL: "public-read"
}).promise()

exports.removeFile = async(Key) => s3.deleteObject({ Bucket: myBucket, Key}).promise()

exports.connect = () => s3.createBucket({Bucket: myBucket}).promise().then(() => {
  console.log("[FileService] Bucket Created")
}).catch(err => {
  if (err.code !== "BucketAlreadyOwnedByYou") console.error(err)
  else console.log("[File Service] Connected")
})