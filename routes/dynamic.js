const router = require('koa-router')()
const mongoose = require('mongoose')

const {connect,initSchema} = require('../database/init')
connect()
initSchema()

const dynamic = mongoose.model('dynamic')
const praise = mongoose.model('praise')
const comment = mongoose.model('comment')
const star = mongoose.model('star')
const user = mongoose.model('user')
const notice = mongoose.model('notice')

router.prefix('/dynamic')

router.get('/praise',async (ctx,next)=>{
  let params = ctx.query

  console.log(params)
  await new Promise((resolve,reject)=>{
    praise.findOne({"dynamicId": params.dynamicId,"userId":params.userId},(err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    if(data){
      await new Promise((resolve,reject)=>{
        praise.deleteOne({"dynamicId": params.dynamicId,"userId":params.userId},(err,data)=>{
          console.log('取消点赞')
          resolve(data)
        })
      }).then(async data=>{
        
        await new Promise((resolve,reject)=>{
          // dynamic.update({"_id": params.dynamicId},{"$inc":{"praiseNum":-1}},(err,data)=>{
          //   console.log(data)
          // })

          dynamic.update({"_id": params.dynamicId},{$pull:{'praise': params.userId}},(err,data)=>{
            console.log(data)
          })
        })
      })
      
    }else{
      let praisexx = {
            dynamicId: params.dynamicId,
            userId: params.userId,
            dynamicUserId: params.dynamicUserId
          }
      let onePraise = new praise(praisexx)
      
      await new Promise((resolve,reject)=>{
        onePraise.save().then(data=>{
          console.log('点赞成功')
          resolve(data)
        })
      }).then(async data=>{
        await new Promise((resolve,reject)=>{
          // dynamic.update({"_id": params.dynamicId},{"$inc":{"praiseNum":1}},(err,data)=>{
          //   console.log(data)
          // })

          dynamic.update({"_id": params.dynamicId},{$addToSet:{"praise": params.userId}},(err,data)=>{
            resolve(data)
          })
        })

        await new Promise((resolve,reject)=>{
          notice.update({"userId": params.dynamicUserId},{"$inc": {"newPraise": 1}},{upsert: true},(err,data)=>{

          })
        })
        
      })
    }
  })
})

router.post('/comment',async (ctx,next)=>{
  // console.log(ctx.request.body)
  let params = ctx.request.body
  console.log(params)
  let commnetxx = params
  commnetxx.createTime = new Date
  let oneComment = new comment(commnetxx)
  await new Promise((resolve,reject)=>{
    oneComment.save().then(data=>{
      resolve(data)
    })
  }).then(async data=>{
    await new Promise((resolve,reject)=>{
       dynamic.update({"_id": params.dynamicId},{"$inc":{"commentsNum":1}},(err,data)=>{
         resolve(data)
       })
    })

    await new Promise((resolve,reject)=>{
      notice.update({"userId": params.dynamicUserId},{"$inc": {"newComments": 1}},{upsert: true},(err,data)=>{

      })
    })

  })
})

router.get('/getCommnet',async (ctx,next)=>{
  // console.log(ctx.request.query)

  await new Promise((resolve,reject)=>{
    comment.find({"dynamicId": ctx.query.dynamicId}).populate([{path:'userId',select:['nickName','avatar']},{path:'reply.toId',select:['nickName','avatar']},{path:'reply.fromId',select:['nickName','avatar']}]).sort({'createTime': -1}).exec((err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success getCommnet',
      state: 1,
      data: data
    }
  })
})

router.post('/reply',async (ctx,next)=>{
  // console.log(ctx.request.body)
  let params = ctx.request.body
  params.createTime = new Date
  await new Promise((resolve,reject)=>{
    comment.findByIdAndUpdate(params.commentId,{$push:{'reply': params}},{  safe: true, upsert: true},(err,data)=>{
      resolve(data)
    })
  }).then(data=>{
    ctx.body = {
      message: 'success',
      state: 1
    }
  })
})

router.get('/star',async (ctx,next)=>{
  // console.log(ctx.request.query)
  let params = ctx.request.query
  console.log(params)
  await new Promise((resolve,reject)=>{
    star.findOne({'dynamicId': params. dynamicId,'userId': params.userId},(err,data)=>{
      resolve(data)
    })
  }).then(async data=>{
    if(!data){
      params.createTime = new Date
      let oneStar = new star(params)

      await new Promise((resolve,reject)=>{
        oneStar.save().then(data=>{
          resolve(data)
        })
      }).then(async data=>{

        await new Promise((resolve,reject)=>{
          user.update({"_id":params.userId},{"$inc":{"star": 1}},(err,data)=>{
            resolve(data)
          })
        }).then(data=>{
          ctx.body = {
            message: 'success star',
            state: 1
          }
        })
      })

    }else{
      ctx.body = {
        message: 'exist',
        state: 2
      }
    }
  })
})

router.get('/deleteComment', async (ctx,next)=>{
  console.log(ctx.request.query)
  let params = ctx.request.query

  await new Promise((resolve,reject)=>{
    comment.findByIdAndDelete({"_id":params.commentId},(err,data)=>{
      resolve(data)
    })
  }).then(async data=>{

    await new Promise((resolve,reject)=>{
      dynamic.update({"_id": params.dynamicId},{"$inc":{"commentsNum": -1}},(err,data)=>{
        resolve(data)
      })
    }).then(data=>{
      ctx.body = {
        message: 'success deleteComment',
        state: 1,
        body: 1
      }
    })

    
  })
  
})


module.exports = router
