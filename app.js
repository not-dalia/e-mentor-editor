var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var stylus = require('stylus')
var cookieSession = require('cookie-session')
var fs = require('fs')
var yaml = require('js-yaml')

require('dotenv').config()

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var authRouter = require('./routes/auth')
var formsRouter = require('./routes/forms')
var trackerRouter = require('./routes/tracker')

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
app.use('/+users', usersRouter)
app.use('/+auth', authRouter)
app.use('/+forms', formsRouter)
app.use('/+track', trackerRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

const config = _loadConfig()
app.locals = {
  appName: config.appName,
  baseUrl: process.env.HOST + process.env.BASE_URL,
  moment: require('moment')

}

function _loadConfig () {
  try {
    var doc = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf-8'))
    console.log(doc)
    return doc
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = app
