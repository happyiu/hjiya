const mongoose = require('mongoose')
const Schema = mongoose.Schema

var chatSchema = new Schema({
  channel:{
    type: String,
    required: true
  },
  chatList:[{
    time: Date,
    userId: String,
    content: String
  }],
  fromUserId: {
    type:String,
    ref: 'user'
  },
  toUserId: {
    type:String,
    ref: 'user'
  }
})

mongoose.model('chat',chatSchema)