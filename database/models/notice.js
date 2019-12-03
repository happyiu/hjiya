const mongoose = require('mongoose')
const Schema = mongoose.Schema

var noticeSchema = new Schema({
  userId:{
    type: String,
    required: true
  },
  newPraise:{
    type: Number,
    default: 0
  },
  newComments: Number,
  newFans: Number,
  newChat: Number
})

mongoose.model('notice',noticeSchema)