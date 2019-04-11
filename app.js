var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var stylus = require('stylus')
var cookieSession = require('cookie-session')
const config = require('./utils/config')

require('dotenv').config()

var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var formsRouter = require('./routes/forms')
var trackerRouter = require('./routes/tracker')
var submissionsRouter = require('./routes/submissions')
var analyticsRouter = require('./routes/analytics')

var app = express()

app.set('trust proxy', 1) // trust first proxy

app.use(
  cookieSession({
    sameSite: true,
    name: 'mentoreditorsession',
    keys: ['key1', 'key2']
  })
)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.set('view cache', false)

app.use(logger('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(cookieParser())
app.use(stylus.middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/+', indexRouter)
app.use('/+auth', authRouter)
app.use('/+forms', formsRouter)
app.use('/+track', trackerRouter)
app.use('/+submissions', submissionsRouter)
app.use('/+analytics', analyticsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

app.locals = {
  appName: config.appName,
  baseUrl: process.env.HOST + process.env.BASE_URL,
  moment: require('moment')

}

module.exports = app
