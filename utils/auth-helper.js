const config = require('../utils/config')
let db = require('../utils/db-helper')
var qs = require('querystring')
var https = require('https')

function getUserRepos (token, cb) {
  var data = qs.stringify({
  })

  var reqOptions = {
    host: 'api.' + process.env.GH_HOST,
    port: 443,
    path: '/user/repos',
    method: 'GET',
    headers: { 'Authorization': `token ${token}`, 'User-Agent': 'not-dalia', 'content-length': data.length }
  }

  var body = ''
  var req = https.request(reqOptions, function (res) {
    res.setEncoding('utf8')
    res.on('data', function (chunk) {
      body += chunk
    })
    res.on('end', function () {
      let repos = JSON.parse(body)
      let authorised = false
      if (!config || !config.owner || !config.repo) {
        cb(new Error('Cannot parse config file'))
      }
      for (let i = 0; i < repos.length; i++) {
        if (repos[i].full_name === `${config.owner}/${config.repo}`) {
          authorised = true
          break
        }
      }
      console.log('auth result: ' + authorised)
      cb(null, { authorised: authorised })
    })
  })
  req.write(data)
  req.end()
  req.on('error', function (e) {
    cb(e.message)
  })
}

const authUser = async function (req, res, next) {
  if (!req.session.token) {
    res.authenticated = false
    req.session.repoCheckTime = null
    next()
  } else {
    if (req.session.repoCheckTime && req.session.repoCheckTime > Date.now()) {
      res.authenticated = true
      let notifications = await db.getUnreadSubmissionsCount()
      res.unreadNotifications = notifications[0] ? notifications[0].c : 0
      next()
      return
    }
    getUserRepos(req.session.token, async (err, authorised) => {
      if (err || !authorised.authorised) {
        console.log(err)
        res.authenticated = false
      } else {
        res.authenticated = true
        console.log('setting repo check time')
        req.session.repoCheckTime = Date.now() + 5 * 60 * 1000
        let notifications = await db.getUnreadSubmissionsCount()
        res.unreadNotifications = notifications[0] ? notifications[0].c : 0
      }
      next()
    })
  }
}

module.exports = {
  getUserRepos, authUser
}
