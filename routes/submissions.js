var express = require('express')
var router = express.Router()
let db = require('../utils/db-helper')

const authUser = async function (req, res, next) {
  if (!req.session.token) {
    res.authenticated = false
  } else {
    res.authenticated = true
    let notifications = await db.getUnreadSubmissionsCount()
    res.unreadNotifications = notifications[0] ? notifications[0].c : 0
  }
  next()
}
router.use(authUser)

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let submissions = await db.getSubmissionsWithMetadata()
      console.log(submissions)
      res.render('submissions', {
        title: 'Submissions',
        submissions: submissions,
        authenticated: res.authenticated,
        selectedTab: 'submissions',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Submissions',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Submissions',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/request/:id', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let submission = await db.getSubmissionById(req.params.id, false)
      let session, visitorData
      if (submission[0].action_id) {
        session = await db.getSubmissionTrackingData(submission[0].action_id)
        visitorData = await db.getVisitorOverallInfo(submission[0].user_id)
      }
      console.log(session)
      db.markSubmissionAsSeen(submission[0].metadata_id)
      res.render('request', {
        title: 'Submission',
        submissions: submission,
        session: session,
        visitor: visitorData,
        authenticated: res.authenticated,
        selectedTab: 'submissions',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Submission',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Submission',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/recommend/:id', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let submission = await db.getSubmissionById(req.params.id, true)
      let session, visitorData
      if (submission[0].action_id) {
        session = await db.getSubmissionTrackingData(submission[0].action_id)
        visitorData = await db.getVisitorOverallInfo(submission[0].user_id)
      }
      console.log(submission)
      db.markSubmissionAsSeen(submission[0].metadata_id)
      res.render('request', {
        title: 'Submission',
        submissions: submission,
        session: session,
        visitor: visitorData,
        authenticated: res.authenticated,
        selectedTab: 'submissions',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Submission',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Submission',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

module.exports = router
