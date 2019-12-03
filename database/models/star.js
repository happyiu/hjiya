const mongoose = require('mongoose')
const Schema = mongoose.Schema

let starSchema = new Schema({
  userId:{
    type: String,
    required: true
  },
  dynamicId:{
    type: String,
    required: true,
    ref: 'dynamic'
  },
  dynamicUserId:{
    type: String,
    required: true,
    ref: 'user'
  },
  createTime:{
    type: Date,
    default: new Date
  }
})

mongoose.model('star',starSchema)
