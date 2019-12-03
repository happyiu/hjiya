const mongoose = require('mongoose')
const Schema = mongoose.Schema


var dynamicSchema = new Schema({
  userId:{
    type: String,
    required: true,
    ref:'user'
  },
  createTime:{
    type: Date,
    required: true,
    default: new Date
  },
  content:{
    type: String
  },
  imgList:{
    type: Array
  },
  communityId:{
    type: Number,
    default: 0
  },
  commentsNum:{
    type: Number,
    default: 0
  },
  praise: Array
})

mongoose.model("dynamic",dynamicSchema)