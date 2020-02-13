const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
const myBucket = process.env.BUCKET || 'random-bucket'

AWS.config.update({ params: { Bucket: myBucket },region: 'eu-west-3'})

const s3 = new AWS.S3()

exports.uploadFile = ({ Body, ContentType }) => s3.upload({
  Bucket: myBucket,
  Key: uuid(),
  Body,
  ContentType,
  ACL: "public-read"
}).promise()

exports.removeFile = async(Key) => s3.deleteObject({ Bucket: myBucket, Key}).promise()

const maxTries = 12
const timeout = 10000
let tries = 0

exports.connect = () => s3.createBucket({Bucket: myBucket}).promise().then(() => {
  console.log("[FileService] Bucket Created")
}).catch(err => {
  if (err.code !== "BucketAlreadyOwnedByYou") {
    if (err.retryable && tries < maxTries) {
      console.log("[File Service] Connection failed, trying again...")
      setTimeout(() => {
        tries = tries + 1
        this.connect()
      }, timeout)
    } else {
      console.error(err)
    }
  }
  else {
    console.log("[File Service] Connected to " + myBucket)
    tries = 0
  }
})