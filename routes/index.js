const router = require('koa-router')()
const mongoose = require('mongoose')
const md5 = require('blueimp-md5')
const Core = require('@alicloud/pop-core')

const qnconfig = require('../qiniu/config')

const {connect,initSchema} = require('../database/init')
connect()
initSchema()
const user = mongoose.model('user')
const dynamic = mongoose.model('dynamic')
const praise = mongoose.model('praise')

var client = new Core({
  accessKeyId: 'LTAI4FbzGuDjz2bg1MJwJKBV',
  accessKeySecret: 'KX81dgS616b06Xo6YodNnZYm7nAAZ9',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});
let params = {
  "RegionId": "cn-hangzhou",
  "PhoneNumberJson": "[\"13116841683\"]",
  "SignNameJson": "[\"浮世绘通\"]",
  "TemplateCode": "SMS_178456463",
  "TemplateParamJson": "[{\"code\":\"159753\"}]"
}
var requestOption = {
  method: 'POST'
};

let rNum = 0


router.get('/', async (ctx, next) => {
  ctx.body = `<h1>Index</h1>
  <form action="/dx" method="post">
      <p>phone: <input name="phone" value=""></p>
      <p><input type="submit" value="Submit"></p>
  </form>`

})

router.post('/Login', async (ctx, next) => {

  let userInformation = ctx.request.body
  console.log(userInformation)
  userInformation.password = md5(md5(userInformation.password))

  await new Promise((resolve,reject)=>{
    user.findOne({
      "phone": userInformation.phone
    },(err,data)=>{
      if(err){
        console.log(err)
      }
      if(data){
        resolve(data)        
      }else{
        resolve(data)        
      }
    })
  }).then(async data=>{
    // console.log(data)
    ctx.set("Content-Type","application/json")
    // console.log(data.password,userInformation.password)
    if(data){
      if(data.password == userInformation.password){
        let newUser = {
          _id: data._id,
          avatar: data.avatar,
          nickName: data.nickName, 
          city: data.city,
          gender: data.gender,
          phone: data.phone, 
          sign: data.sign,
          star: data.star,
          fans: data.fans,
          follow: data.follow
        }

        console.log('登录成功')
        ctx.body = {
          msg: 'success',
          state: 1,
          data: newUser
        }
      }
      if(data.password !== userInformation.password){
        console.log('密码错误')
        ctx.body = {
          msg: 'password error',
          state: 2,
          data: data
        }
      }
    }
    else{
      ctx.body = {
        msg: 'Not Find Count',
        state: 0,
        data: data
      }
    }
  })
})

router.post('/register', async (ctx, next) => {
  let userInformation = ctx.request.body
  userInformation.password = md5(md5(userInformation.password))

  if(userInformation.code == rNum){
    await new Promise((resolve,reject)=>{
      user.findOne({
        "phone": userInformation.phone
      },(err,data)=>{
        if(err){
          console.log(err)
        }
        if(data){
          resolve(data)
        }else{
          resolve(data)
        }
      })
    }).then(async data=>{
      if(!data){
        let oneUser = new user(userInformation)
  
        await new Promise((resolve,reject)=>{
          oneUser.save().then((data)=>{
            console.log('插入成功')
            resolve(data)
          })
        }).then(async data=>{
          ctx.set("Content-Type","application/json")
          ctx.body = {
            message: 'success',
            state: 1,
            data: data
          }
        })
  
      }else{
        console.log('插入失败')
        ctx.set("Content-Type","application/json")
        ctx.body = {
          message: 'err',
          state: 0,
          data: data
        }
      }
    })
  }else{
    ctx.body = {
      message: "yzCode is error",
      state: 3
    }
  }



})

router.post('/dx', async (ctx, next) => {

  console.log(ctx.request.body)
  params.PhoneNumberJson = "[\""+ ctx.request.body.phone +"\"]"
  let randomNum = Math.round(Math.random()*10000 + Math.random()*10000 + Math.random()*1000 + Math.random()*100 + Math.random()*10) 
  rNum = randomNum
  params.TemplateParamJson = "[{\"code\":\""+ randomNum +"\"}]"

  client.request('SendBatchSms', params, requestOption).then((result) => {
    console.log(JSON.stringify(result));
  }, (ex) => {
    console.log(ex);
  })
})

router.get('/token', async (ctx, next) => {
  ctx.body = qnconfig.uploadToken
})

router.get('/getUserInfo',async (ctx,next)=>{
  let params = ctx.request.query
  await new Promise((resolve,reject)=>{
    user.findOne({"_id":params.userId},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    let newUser = {
      _id: data._id,
      avatar: data.avatar,
      nickName: data.nickName, 
      city: data.city,
      gender: data.gender,
      sign: data.sign,
      star: data.star,
      fans: data.fans,
      follow: data.follow
    }
    
    ctx.body = {
      message: 'success get User message',
      state: 1,
      data: newUser
    }
  })
})

router.post('/dynamic', async (ctx, next) => {

  console.log(ctx.request.body)
  if(ctx.request.body.imgList){
    ctx.request.body.imgList = ctx.request.body.imgList.split(',')
  }
  
  let oneDynamic = new dynamic(ctx.request.body)

  await new Promise((resolve,reject)=>{
    oneDynamic.save().then(data=>{
      console.log(data)
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success save',
      state: 1,
      data: data
    }
  })


  ctx.body = {
    message: 'success'
  }
})

router.get('/getDynamics', async (ctx, next) => {
  let pageIndex =  ctx.query.pageIndex
  let page = 10
  let skipPage = (pageIndex-1) * 10

  await new Promise((resolve,reject)=>{
    dynamic.find({}).populate({path:'userId',select:['nickName','avatar']}).sort({'createTime':-1}).skip(skipPage).limit(page).exec((err,docs)=>{
      // console.log(docs.length)
      resolve(docs)
    })
  }).then(data => {
    if(data){
      ctx.body = {
        message: 'success dynamic',
        state: 1,
        data: data
      }
    }
  })
  
})

router.get('/getDynamicsById',async (ctx,next)=>{
  let params = ctx.request.query
  let page = 10
  let skipPage = (params.pageIndex-1) * 10

  // console.log(params)

  await new Promise((resolve,reject)=>{
    dynamic.find({"userId": params.userId}).populate({path: 'userId',select:['nickName','avatar']}).sort({'createTime': -1}).skip(skipPage).limit(page).exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getDynamicsById',
      state: 1,
      data: data
    }
  })

})

router.get('/dynamicDetails', async (ctx, next) => {
  // console.log(ctx.request.query)
  let params = ctx.request.query.dynamicId

  await new Promise((resolve,reject)=>{
    dynamic.find({"_id": params}).populate({path:'userId',select:['nickName','avatar']}).exec((err,docs)=>{
      resolve(docs)
    })
  }).then(data => {
    ctx.body = {
      message: 'success getDynamic',
      state: 1,
      data: data
    }
  })
  
})

router.get('/deleteDynamic',async (ctx,next)=>{
  console.log(ctx.request.query)
  let dynamicId = ctx.request.query.dynamicId
  await new Promise((resolve,reject)=>{
    dynamic.deleteOne({"_id":dynamicId},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success dynamic',
      state: 1
    }
  })
  
})

router.get('/json', async (ctx, next) => {

})

module.exports = router
