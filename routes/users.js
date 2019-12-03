const router = require('koa-router')()
const mongoose = require('mongoose')
const {connect,initSchema} = require('../database/init')
connect()
initSchema()
const user = mongoose.model('user')
const followfans = mongoose.model('followfans')
const star = mongoose.model('star')
const dynamic = mongoose.model('dynamic')
const notice = mongoose.model('notice')

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.post('/edit', async (ctx, next) => {
  ctx.set("Content-Type","application/json")
  let whereStr = {}
  whereStr._id = ctx.request.body._id
  let value = Object.keys(ctx.request.body)[1]
  let updateStr = {}
  updateStr[value] = ctx.request.body[value]

  await new Promise((resolve,reject)=>{
    user.update({'_id': ctx.request.body._id},updateStr,(err,data)=>{
      if(err){
        console.log(err)
      }
      if(data){
        resolve(data)
      }
    })
  }).then(async data=>{
    ctx.response.body = {
      message: "edit success",
      state: 1,
      data: updateStr
    }
  })



})

router.get('/clickFollow',async (ctx,next)=>{
  let params = ctx.request.query
  await new Promise((resolve,reject)=>{
    followfans.findOne(params,(err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    if(!data){
      let oneFollowFans = new followfans(params)
      oneFollowFans.createTime = new Date

      await new Promise((resolve,reject)=>{
        oneFollowFans.save().then(data=>{
          resolve(data)
        })
      }).then(async data=>{
        // console.log(data)
        await new Promise((resolve,reject)=>{
          user.update({"_id":data.fromUserId},{"$inc":{"follow": 1}},(err,data)=>{
            resolve(data)
          })
        })

        await new Promise((resolve,reject)=>{
          user.update({"_id":data.toUserId},{"$inc":{"fans": 1}},(err,data)=>{
            resolve(data)
          })
        })

        await new Promise((resolve,reject)=>{
          console.log('1')
          notice.update({"userId": params.toUserId},{"$inc": {"newFans": 1}},{upsert: true},(err,data)=>{
            resolve(data)
          })
        })
         
        ctx.body = {
          message: 'success follow',
          state: 1,
          data: 1
        }

      })
    }else{
      await new Promise((resolve,reject)=>{
        followfans.findOneAndDelete(params,(err,data)=>{
          resolve(data)
        })
      }).then(async data=>{

        await new Promise((resolve,reject)=>{
          user.update({"_id":data.fromUserId},{"$inc":{"follow": -1}},(err,data)=>{
            resolve(data)
          })
        })

        await new Promise((resolve,reject)=>{
          user.update({"_id":data.toUserId},{"$inc":{"fans": -1}},(err,data)=>{
            resolve(data)
          })
        })

        ctx.body = {
          message: 'success cancel follow',
          state: 1,
          data: 0
        }
      })
    }
  })
  
})

router.get('/isFollow',async (ctx,next)=>{
  let params = ctx.request.query
  console.log(params)
  await new Promise((resolve,reject)=>{
    followfans.findOne(params,(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    if(data){
      ctx.body = {
        message: 'is follow',
        state: 1,
        data: 1
      }
    }else{
      ctx.body = {
        message: 'is not follow',
        staet: 1,
        data: 0
      }
    }
  })
  
})

router.get('/getFollows',async (ctx,next)=>{
  console.log(ctx.query)
  let userId = ctx.request.query.userId

  await new Promise((resolve,reject)=>{
    followfans.find({"fromUserId": userId}).populate({path: 'toUserId',select: ['nickName','avatar','sign']}).sort({'createTime': -1}).exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getFollows',
      state: 1,
      data: data
    }
  })
})

router.get('/getFans',async (ctx,next)=>{
  console.log(ctx.query)
  let userId = ctx.request.query.userId

  await new Promise((resolve,reject)=>{
    followfans.find({"toUserId": userId}).populate({path: 'fromUserId',select: ['nickName','avatar','sign']}).sort({'createTime': -1}).exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getFans',
      state: 1,
      data: data
    }
  })
})

router.get('/getStar', async (ctx,next)=>{
  let params = ctx.request.query
  let page = 10
  let skipPage = (params.pageIndex - 1) * page
  await new Promise((resolve,reject)=>{
    star.find({'userId': params.userId})
    .populate([{path: 'dynamicUserId',select:['nickName','avatar']},{path: 'dynamicId',select:['content','createTime','imgList']}])
    .sort({"createTime": -1})
    .skip(skipPage)
    .limit(page)
    .exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getStar',
      state: 1,
      data: data
    }
  })

})

router.get('/deleteStar',async (ctx,next)=>{
  let params = ctx.query
  console.log(params)

  await new Promise((resolve,reject)=>{
    star.findByIdAndDelete({"_id": params.starId},(err,data)=>{
      resolve(data)
    })
  })

  await new Promise((resolve,reject)=>{
    user.update({'_id': params.userId},{"$inc": {"star": -1}},(err,data)=>{
      resolve(data)
    })
  })

  ctx.body = {
    message: 'success delete',
    state: 1,
    data: 1
  }
})

module.exports = router
