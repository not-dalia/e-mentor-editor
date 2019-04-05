let express = require('express')
let router = express.Router()
let db = require('../utils/db-helper')
const logger = require('../utils/logger')
const cors = require('cors')

router.use(cors({
  credentials: true,
  origin: ['https://not-dalia.github.io', 'http://not-dalia.github.io', 'https://qudwa.me', 'http://qudwa.me', 'https://www.qudwa.me', 'http://www.qudwa.me'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  headers: ['X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version']
}))

router.post('/form-submit/', async function (req, res) {
  try {
    console.log(req.body)
    let data = {}
    let result
    switch (req.body['form-type']) {
      case 'recommend-mentor':
        data.name = req.body.mentorname && req.body.mentorname.trim()
        data.email = req.body.mentoremail && req.body.mentoremail.trim()
        data.mobile = req.body.mentorphone && req.body.mentorphone.trim()
        Object.keys(req.body).forEach(el => {
          if (el.indexOf('mentorsocial_') === 0) {
            if (!data.social_profiles) data.social_profiles = []
            if (req.body[el] && req.body[el].trim()) data.social_profiles.push(req.body[el].trim())
          }
        })
        result = await db.insertRecommendMentorSubmission(data)
        break
      case 'request-help':
        data.name = req.body.name && req.body.name.trim()
        data.type = req.body['form-type'] && req.body['form-type'].trim()
        data.email = req.body.email && req.body.email.trim()
        data.mobile = req.body.phone && req.body.phone.trim()
        data.interests = req.body['interest-field'] && req.body['interest-field'].trim()
        data.introduction = req.body.describe && req.body.describe.trim()
        data.contactReason = req.body.reason && req.body.reason.trim()
        data.dob = new Date(parseInt(req.body['birthday-year']), parseInt(req.body['birthday-month']) - 1, parseInt(req.body['birthday-day']))
        result = await db.insertHelpSubmission(data)
        break
      case 'request-meeting':
        if (!req.body.mentor) {
          throw new Error('Missing mentor field')
        }
        data.mentor = req.body.mentor && req.body.mentor.trim()
        data.type = req.body['form-type'] && req.body['form-type'].trim()
        data.name = req.body.name && req.body.name.trim()
        data.email = req.body.email && req.body.email.trim()
        data.mobile = req.body.phone && req.body.email.trim()
        data.commMethod = req.body.communication && req.body.communication.trim()
        data.introduction = req.body.describe && req.body.describe.trim()
        data.contactReason = req.body.reason && req.body.reason.trim()
        data.dob = new Date(parseInt(req.body['birthday-year']), parseInt(req.body['birthday-month']) - 1, parseInt(req.body['birthday-day']))
        result = await db.insertRequestMeetingSubmission(data)
        break
      case 'request-whatsapp':
        if (!req.body.mentor) {
          throw new Error('Missing mentor field')
        }
        data.mentor = req.body.mentor && req.body.mentor.trim()
        data.type = req.body['form-type'] && req.body['form-type'].trim()
        data.name = req.body.name && req.body.name.trim()
        data.email = req.body.email && req.body.email.trim()
        data.mobile = req.body.phone && req.body.email.trim()
        data.introduction = req.body.describe && req.body.describe.trim()
        data.contactReason = req.body.reason && req.body.reason.trim()
        data.dob = new Date(parseInt(req.body['birthday-year']), parseInt(req.body['birthday-month']) - 1, parseInt(req.body['birthday-day']))
        result = await db.insertJoinWhatsappSubmission(data)
        break
      case 'request-intro':
        if (!req.body.mentor) {
          throw new Error('Missing mentor field')
        }
        data.mentor = req.body.mentor && req.body.mentor.trim()
        data.type = req.body['form-type'] && req.body['form-type'].trim()
        data.name = req.body.name && req.body.name.trim()
        data.email = req.body.email && req.body.email.trim()
        data.mobile = req.body.phone && req.body.email.trim()
        data.connectThrough = req.body['connect-through'] && req.body['connect-through'].trim()
        data.socialAccount = req.body['social-profile'] && req.body['social-profile'].trim()
        data.introduction = req.body.describe && req.body.describe.trim()
        data.contactReason = req.body.reason && req.body.reason.trim()
        data.dob = new Date(parseInt(req.body['birthday-year']), parseInt(req.body['birthday-month']) - 1, parseInt(req.body['birthday-day']))
        result = await db.insertRequestIntroSubmission(data)
        break
      default:
        throw new Error('Invalid form type')
    }
    res.status(200).send()

    db.insertRequestMetaData({ requestId: result.insertId, type: req.body['form-type'] && req.body['form-type'].trim(), userId: req.body.uid, actionId: req.body.aid, language: req.body.l })
    console.log(result)
  } catch (e) {
    console.log(e)
    logger.forms.info(req.body)
    logger.forms.error(e)
    res.status(500).send(e.message)
  }
})

module.exports = router
