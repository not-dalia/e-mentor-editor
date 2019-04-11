let express = require('express')
let router = express.Router()
let db = require('../utils/db-helper')
const logger = require('../utils/logger')

// eslint-disable-next-line
const trackImg = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

router.get('/pixel', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': trackImg.length
  })
  console.log(req.query)
  res.send(trackImg)
  let whitelistedDomains = [/^https?:\/\/([a-zA-Z\d-]+\.){0,}qudwa\.me/]
  let whitelisted = false
  let referrer = req.get('referrer')
  whitelistedDomains.forEach(el => {
    if (el.test(referrer)) {
      whitelisted = true
    }
  })

  if (whitelisted) {
    try {
      let extraData = req.query.ed || {}
      extraData.referrer = req.query.rf
      insertOrUpdateVisitor(req.query)
      db.insertAction({
        actionId: req.query.aid,
        visitorId: req.query.uid,
        actionType: req.query.at,
        url: req.query.u,
        actionData: req.query.ad,
        language: req.query.l,
        extraData: extraData,
        sessionId: req.query.sid
      })
    } catch (err) {
      logger.tracking.error(err)
      logger.tracking.info(req.query)
    }
  }
})

async function insertOrUpdateVisitor (query) {
  try {
    let visitor = await db.getVisitorById(query.uid)
    if (visitor && visitor.length > 0) {
      if (query.at === 'visit') {
        db.updateVisitorPageCount({ visitorId: query.uid })
      }
      let session = await db.getSessionById(query.sid, query.uid)
      if (!(session && session[0])) {
        db.updateVisitorSessionCount({ visitorId: query.uid })
        db.insertSession({
          sessionId: query.sid,
          visitorId: query.uid
        })
      }
    } else {
      db.insertNewVisitor({
        visitorId: query.uid
      })
      db.insertSession({
        sessionId: query.sid,
        visitorId: query.uid
      })
    }
  } catch (err) {
    logger.tracking.error(err)
    logger.tracking.info(query)
  }
}

module.exports = router
