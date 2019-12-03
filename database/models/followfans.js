const mongoose = require('mongoose')
const Schema = mongoose.Schema

let followfansSchema = new Schema({
  fromUserId:{
    type:String,
    required: true,
    ref: 'user'
  },
  toUserId:{
    type: String,
    required: true,
    ref: 'user'
  },
  createTime:{
    type: Date,
    default: new Date
  }
})

mongoose.model('followfans',followfansSchema)