const mongoose = require('mongoose')
const Schema = mongoose.Schema

var commentSchema = new Schema({
  dynamicId:{
    type: String,
    required: true,
    ref: 'dynamic'
  },
  userId:{
    type: String,
    required: true,
    ref: 'user'
  },
  dynamicUserId:{
    type: String,
    ref: 'user'
  },
  content:{
    type: String
  },
  img:{
    type: String
  },
  createTime:{
    type: Date,
    default: new Date
  },
  reply: [{
    fromId: {
      type: String,
      ref: 'user'
    },
    content: String,
    toId: {
      type: String,
      ref: 'user'
    },
    createTime:{
      type: Date,
      default: new Date
    }
  }]
})

mongoose.model("comment",commentSchema)