const mongoose = require('mongoose')
const Scheam = mongoose.Schema

var usersSchema = new Scheam({
  phone:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  createTime:{
    type: Date,
    default: new Date
  },
  lastLoginTime:{
    type: Date,
    default: new Date
  },
  nickName:{
    type: String,
    default: '黄即用户'
  },
  avatar:{
    type: String,
    default:'/static/image/defalut.png'
  },
  gender:{
    type: Number,
    enum:[-1,0,1],
    default: -1
  },
  sign:{
    type: String
  },
  city:{
    type: String
  },
  birthday:{
    type:Date
  },
  status:{
    type: Number,
    enum: [1,2],
    default: 0
  },
  star:Number,
  fans:Number,
  follow:Number
})

mongoose.model("user",usersSchema)