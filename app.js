const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors')

const index = require('./routes/index')
const users = require('./routes/users')
const dynamic = require('./routes/dynamic')
const search = require('./routes/search')
const message = require('./routes/message')

const {connect,initSchema} = require('./database/init')
const mongoose = require('mongoose')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))
app.use(cors())
// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(dynamic.routes(),dynamic.allowedMethods())
app.use(search.routes(),search.allowedMethods())
app.use(message.routes(),message.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
