let express = require('express')
let router = express.Router()
let db = require('../utils/db-helper')
const logger = require('../utils/logger')

router.get('/request-intro/', async function (req, res) {
  try {
    let result = await db.getTest()
    res.json({
      success: true,
      result: result
    })
  } catch (e) {
    res.json({
      success: false,
      error: e
    })
    logger.error(e)
  }
})

module.exports = router
