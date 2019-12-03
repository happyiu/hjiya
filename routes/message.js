const router = require('koa-router')()
const mongoose = require('mongoose')
const {connect,initSchema} = require('../database/init')
connect()
initSchema()

const chat = mongoose.model('chat')
const notice = mongoose.model('notice')
const praise = mongoose.model('praise')
const followfans = mongoose.model('followfans')
const comment = mongoose.model('comment')
const user = mongoose.model('user')

router.prefix('/message')

router.get('/getMessage',async (ctx,next)=>{
  console.log(ctx.request.query)
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    notice.find({"userId": params.userId},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getMessage',
      state: 1,
      data: data
    }
  })
  
})

router.get('/getPraise',async (ctx,next)=>{
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    praise.find({"dynamicUserId": params.userId}).populate([{path:"dynamicId",select:["content"]},{path:"userId",select:["nickName","avatar","sign"]}]).sort({"createTime": -1}).limit(10).exec((err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    ctx.body = {
      message: 'success getPraiseList',
      state: 1,
      data: data
    }

    await new Promise((resolve,reject)=>{
      notice.update({"userId":params.userId},{"newPraise": 0},(err,data)=>{
        resolve(data)
      })
    })
    
  })
})

router.get('/getFollow',async (ctx,next)=>{
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    followfans.find({"toUserId": params.userId}).populate({path:"fromUserId",select:["nickName","avatar","sign"]}).sort({"createTime": -1}).limit(10).exec((err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    ctx.body = {
      message: 'success getFollows',
      state: 1,
      data: data
    }

    await new Promise((resolve,reject)=>{
      notice.update({"userId":params.userId},{"newFans": 0},(err,data)=>{
        resolve(data)
      })
    })
  })
})

router.get('/getComments',async (ctx,next)=>{
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    comment.find({'dynamicUserId': params.userId}).populate([{path:"dynamicId",select:["content"]},{path:"userId",select:["nickName","avatar"]}]).sort({"createTime": -1}).limit(10).exec((err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    ctx.body = {
      message: 'success getCommnets',
      state: 1,
      data: data
    }

    await new Promise((resolve,reject)=>{
      notice.update({"userId":params.userId},{"newComments": 0},(err,data)=>{
        resolve(data)
      })
    })
  })
})

router.get('/getToUser',async (ctx,next)=>{
  let params = ctx.request.query
  console.log(params)
  await new Promise((resolve,reject)=>{
    user.find({"_id": params.toUserId},{"avatar":1,"nickName":1},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getToUser',
      state: 1,
      data: data
    }
  })
})

router.post('/uploadChat',async (ctx,next)=>{
  let params = ctx.request.body
  let channel2 = params.channel.split('-')
  let newChannel = channel2[1] + '-' + channel2[0]
  // let noticeUserId = channel2[1]
  console.log('2')

  await new Promise((resolve,reject)=>{
    chat.find({"channel": params.channel},(err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    // {$regex: params.channel | newChannel}
    if(data.length > 0){
      await new Promise((resolve,reject)=>{
        chat.updateOne({"channel": params.channel},{ $push:{"chatList": params.chatList}},(err,data)=>{
          resolve(data)
        })
      })
      
    }else{
      let oneChat = new chat(params)      
      await new Promise((resolve,reject)=>{
        oneChat.save().then(data=>{
          resolve(data)
        })
      })
    }

  })

})


router.get('/downloadChat',async (ctx,next)=>{
  let params = ctx.request.query
  console.log(params)
  // let channel2 = params.channel.split('-')
  // let newChannel = channel2[1] + '-' + channel2[0]

  await new Promise((resolve,reject)=>{
    chat.find({'channel': params.channel})
    .populate([{path: 'fromUserId',select:['avatar','nickName']},{path: 'toUserId',select:['avatar','nickName']}])
    .exec((err,data)=>{
      console.log(data)
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success  getChat',
      state: 1,
      data: data
    }
  })
})


router.get('/getChat',async (ctx,next)=>{
  let params = ctx.request.query
  await new Promise((resolve,reject)=>{
    chat.find({$or:[{"toUserId": params.userId},{"fromUserId": params.userId}]}).populate([{path: 'fromUserId',select:['avatar','nickName']},{path: 'toUserId',select:['avatar','nickName']}]).exec((err,data)=>{
      console.log(data)
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getChat',
      state: 1,
      data: data
    }
  })
})

module.exports = router