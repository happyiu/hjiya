var qiniu = require('qiniu')

const accessKey = "e0pSZDOmm4ulfi_kKMmYwj6dJ08qUN418v4mgFNe"
const secretKey = "8dQ64_atHEUj0XmQgBiZaBb3ZNxTEmODmBpp9-Jd"
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

const options = {
    scope: 'hjiya',
    expires: 7200
  }

const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

module.exports = {
    uploadToken
}