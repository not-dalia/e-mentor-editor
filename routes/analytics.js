var express = require('express')
var router = express.Router()
let db = require('../utils/db-helper')
let moment = require('moment')
var { authUser } = require('../utils/auth-helper')

router.use(authUser)

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let { startDate, endDate, selected } = getTimePeriod(req.query.time)

      let allData = await db.getAllActions(startDate, endDate)
      let dailyActions = await db.getActionsWithTime(startDate, endDate)
      let dailyVisitors = await db.getVisitorsWithTime(startDate, endDate)
      let pageCount = allData.length
      let visitors = []
      let submissions = await db.getSubmissionsCountByDate(startDate, endDate)
      let topVisitedMentor = {}
      let topSubmittedMentor = {}
      let topTags = {}
      let topSearches = {}
      let filter

      console.log(dailyVisitors)
      allData.forEach((el, i) => {
        let extraData = JSON.parse(JSON.parse(el.extra_data))
        if (visitors.indexOf(el.visitor_id) < 0) visitors.push(el.visitor_id)
        if (el.action_type === 'form') {
          if (extraData.mentor && !topSubmittedMentor[extraData.mentor]) {
            topSubmittedMentor[extraData.mentor] = 1
          } else if (extraData.mentor) {
            topSubmittedMentor[extraData.mentor]++
          }
        } else if (el.action_type === 'visit') {
          if (el.action_data.split(':')[0] === 'mentor' && !topVisitedMentor[el.action_data.split(':')[1]]) {
            topVisitedMentor[el.action_data.split(':')[1]] = 1
          } else if (el.action_data.split(':')[0] === 'mentor') {
            topVisitedMentor[el.action_data.split(':')[1]]++
          }
        } else if (el.action_type === 'filter') {
          filter = getQueryFilter(el.action_data)
          filter.tags.forEach(el => {
            if (!topTags[el.trim().toLowerCase()]) topTags[el.trim().toLowerCase()] = 1
            else topTags[el.trim().toLowerCase()]++
          })
          if (filter.query && !topSearches[filter.query.trim().toLowerCase()]) topSearches[filter.query.trim().toLowerCase()] = 1
          else if (filter.query) topSearches[filter.query.trim().toLowerCase()]++
        }
      })

      let topTagsSorted = []
      for (let n in topTags) {
        topTagsSorted.push([n, topTags[n]])
      }
      topTagsSorted.sort((a, b) => {
        return b[1] - a[1]
      })

      let topSearchesSorted = []
      for (let n in topSearches) {
        topSearchesSorted.push([n, topSearches[n]])
      }
      topSearchesSorted.sort((a, b) => {
        return b[1] - a[1]
      })

      let topVisitedMentorSorted = []
      for (let n in topVisitedMentor) {
        topVisitedMentorSorted.push([n, topVisitedMentor[n]])
      }
      topVisitedMentorSorted.sort((a, b) => {
        return b[1] - a[1]
      })

      let topSubmittedMentorSorted = []
      for (let n in topSubmittedMentor) {
        topSubmittedMentorSorted.push([n, topSubmittedMentor[n]])
      }
      topSubmittedMentorSorted.sort((a, b) => {
        return b[1] - a[1]
      })
      console.log(topSubmittedMentor)

      res.render('analytics', {
        title: 'Analytics',
        dailyActions: dailyActions,
        dailyVisitors: dailyVisitors,
        selected: selected,
        totalActions: pageCount,
        totalVisitors: visitors.length,
        totalSubmissions: submissions[0] ? submissions[0].c : 0,
        topTags: topTagsSorted.slice(0, 5),
        topSearches: topSearchesSorted.slice(0, 5),
        topVisitedMentor: topVisitedMentorSorted.slice(0, 5),
        topSubmittedMentor: topSubmittedMentorSorted.slice(0, 5),
        authenticated: res.authenticated,
        selectedTab: 'analytics',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Analytics',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Analytics',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/visitor-paths/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let { startDate, endDate, selected } = getTimePeriod(req.query.time)
      let allData = await db.getAllActions(startDate, endDate)
      let visitors = []

      let formattedData = { order: [], data: {} }
      allData.forEach((el, i) => {
        let key = el.visitor_id + ':' + el.session_id
        if (visitors.indexOf(el.visitor_id) < 0) visitors.push(el.visitor_id)
        if (!formattedData.data[key]) {
          formattedData.data[key] = [el]
          formattedData.order.push(key)
        } else {
          formattedData.data[key].push(el)
        }
      })
      console.log(allData[0])

      res.render('visitor-paths', {
        title: 'Visitor Paths',
        data: formattedData,
        selected: selected,
        authenticated: res.authenticated,
        selectedTab: 'analytics',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Analytics',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Analytics',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/visitor-activity/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let { startDate, endDate, selected } = getTimePeriod(req.query.time)
      let allData = await db.getAllActions(startDate, endDate)
      let days = []

      let formattedData = { order: [], data: {} }
      allData.forEach((el, i) => {
        let key = moment(el.timestamp).format('DD/MM/YY')
        if (days.indexOf(moment(el.timestamp).format('DD/MM/YY')) < 0) days.push(moment(el.timestamp).format('DD/MM/YY'))
        if (!formattedData.data[key]) {
          formattedData.data[key] = [el]
          formattedData.order.push(key)
        } else {
          formattedData.data[key].push(el)
        }
      })

      res.render('visitor-activity', {
        title: 'Visitor Activity',
        data: formattedData,
        id: '',
        selected: selected,
        authenticated: res.authenticated,
        selectedTab: 'analytics',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Analytics',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Analytics',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/visitor-activity/:id', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let { startDate, endDate, selected } = getTimePeriod(req.query.time)
      let allData
      if (req.params.id != null) {
        allData = await db.getActionsByVisitorId(req.params.id, startDate, endDate)
      } else {
        allData = await db.getAllActions(startDate, endDate)
      }
      console.log(req.params.id)
      let days = []

      let formattedData = { order: [], data: {} }
      allData.forEach((el, i) => {
        let key = moment(el.timestamp).format('DD/MM/YY')
        if (days.indexOf(moment(el.timestamp).format('DD/MM/YY')) < 0) days.push(moment(el.timestamp).format('DD/MM/YY'))
        if (!formattedData.data[key]) {
          formattedData.data[key] = [el]
          formattedData.order.push(key)
        } else {
          formattedData.data[key].push(el)
        }
      })

      res.render('visitor-activity', {
        title: 'Visitor Activity',
        data: formattedData,
        id: req.params.id,
        selected: selected,
        authenticated: res.authenticated,
        selectedTab: 'analytics',
        notifications: res.unreadNotifications
      })
    } else {
      res.render('index', {
        title: 'Analytics',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Analytics',
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

function getQueryFilter (query) {
  let filter = { tags: [], query: null }
  if (!query) return filter
  query.split(';').forEach(el => {
    let row = el.split(':')
    if (row.length < 2) return
    let name = row.shift()
    if (name === 'tags') {
      filter.tags = decodeURIComponent(row.join(',')).split(',')
    } else if (name === 'query') {
      filter.query = decodeURIComponent(row.join(','))
    }
  })
  return filter
}

function getTimePeriod (time) {
  let startDate = moment().subtract(1, 'years').startOf('day').format('YYYY/MM/DD HH:mm:ss')
  let selected = 'year'
  switch (time) {
    case 'today':
      startDate = moment().startOf('day').format('YYYY/MM/DD HH:mm:ss')
      selected = 'today'
      break
    case 'week':
      startDate = moment().subtract(1, 'weeks').startOf('day').format('YYYY/MM/DD HH:mm:ss')
      selected = 'week'
      break
    case 'month':
      startDate = moment().subtract(1, 'months').startOf('day').format('YYYY/MM/DD HH:mm:ss')
      selected = 'month'
      break
    case 'year':
      startDate = moment().subtract(1, 'years').startOf('day').format('YYYY/MM/DD HH:mm:ss')
      selected = 'year'
      break
  }
  let endDate = moment().endOf('day').format('YYYY/MM/DD HH:mm:ss')
  return { startDate, endDate, selected }
}

module.exports = router
