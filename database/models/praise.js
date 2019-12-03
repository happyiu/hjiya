const mongoose = require('mongoose')
const Schema = mongoose.Schema

let praiseScheam = new Schema({
  dynamicId:{
    type: String,
    required: true,
    ref: 'dynamic'
  },
  dynamicUserId:{
    type: String,
    ref: 'user'
  },
  userId: {
    type: String,
    require: true,
    ref: 'user'
  },
  createTime:{
    type: Date,
    required: true,
    default: new Date
  }
})

mongoose.model("praise",praiseScheam)

