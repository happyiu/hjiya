const router = require('koa-router')()
const mongoose = require('mongoose')

const {connect,initSchema} = require('../database/init')
connect()
initSchema()

const user = mongoose.model('user')
const dynamic = mongoose.model('dynamic')

router.prefix('/search')

router.get('/getUsers',async (ctx,next)=>{
  // console.log(ctx.request.query)
  let params = ctx.request.query
  await new Promise((resolve,reject)=>{
    
    user.find({"nickName": {'$regex': params.userName}},{'_id':1,'avatar':1,'nickName':1,'sign':1},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getUsers',
      state: 1,
      data: data
    }
  })
})

router.get('/getDynamic',async (ctx,next)=>{
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    dynamic.find({"content": {'$regex': params.dynamicName}},{'createTime':1,'_id':1,'content':1,'imgList':1,'userId':1}).populate({path:'userId',select:['avatar','nickName']}).sort({"createTime": -1}).limit(10).exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getDynamic',
      state: 1,
      data: data
    }
  })
})

module.exports = router

