const mongoose = require('mongoose')
const db = 'mongodb://localhost/hjiya'
const glob = require('glob')
const {resolve} = require('path')

exports.initSchema = ()=>{
  glob.sync(resolve(__dirname,"./models",'**/*.js')).forEach(require)
}

exports.connect = ()=>{
  mongoose.connect(db,{
    useNewUrlParser:true
  })

  return new Promise((resolve,reject)=>{
    mongoose.connection.once("open",()=>{
      console.log('连接成功') 
      resolve()
    }) 
  })
}