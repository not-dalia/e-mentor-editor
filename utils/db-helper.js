let mysql = require('mysql')
const axios = require('axios')
const logger = require('../utils/logger')

class DbHelper {
  constructor () {
    this.initDatabase()
  }

  async initDatabase () {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER_NAME,
      port: process.env.DB_PORT,
      password: process.env.DB_USER_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      connectionLimit: 8,
      supportBigNumbers: true
    })
  }

  execQuery (sqlQuery, queryArgs, logger) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          logger.error(err)
          logger.info({
            sqlQuery,
            queryArgs
          })
          reject(new Error(err))
          return
        }
        connection.query(sqlQuery, queryArgs, function (err, results) {
          connection.release()
          if (err) {
            logger.info({
              sqlQuery,
              queryArgs
            })
            logger.error(err)
            reject(new Error(err))
            return
          }
          resolve(results)
        })
      })
    })
  }

  getSubmissionsWithMetadata () {
    let sqlQuery = 'SELECT * FROM connection_request_metadata ORDER BY `timestamp` DESC'
    return this.execQuery(sqlQuery, null, logger.forms)
  }

  getUnreadSubmissionsCount () {
    let sqlQuery = 'SELECT count(*) AS c FROM connection_request_metadata WHERE is_seen=FALSE'
    return this.execQuery(sqlQuery, null, logger.forms)
  }

  getSubmissionsCountByDate (start, end) {
    let sqlQuery = 'SELECT count(*) AS c FROM request_metadata WHERE timestamp <= ? AND timestamp >= ?'
    return this.execQuery(sqlQuery, [end, start], logger.tracking)
  }

  getSubmissionsByType (type) {
    let sqlQuery = 'SELECT * FROM connection_request WHERE type=? ORDER BY `timestamp` DESC'
    return this.execQuery(sqlQuery, [type], logger.forms)
  }

  getSubmissionById (submissionId, recommendMentor) {
    let sqlQuery = ''
    if (recommendMentor) {
      sqlQuery = 'SELECT * FROM connection_request_metadata WHERE request_id=? AND request_type=?'
    } else {
      sqlQuery = 'SELECT * FROM connection_request_metadata WHERE request_id=? AND NOT request_type=?'
    }
    return this.execQuery(sqlQuery, [submissionId, 'recommend-mentor'], logger.forms)
  }

  getSubmissionTrackingData (actionId) {
    let sqlQuery = 'SELECT `action`.*, t.visitor_id, t.session_id FROM (SELECT * FROM qudwa.action WHERE action_id = ?) AS t LEFT JOIN `action` ON t.session_id = `action`.session_id AND t.visitor_id = `action`.visitor_id AND `action`.`timestamp` <= t.`timestamp` ORDER BY timestamp DESC;'
    return this.execQuery(sqlQuery, [actionId], logger.forms)
  }

  getVisitorOverallInfo (visitorId) {
    let sqlQuery = "SELECT COUNT(DISTINCT (action_id)) as actions, COUNT(DISTINCT (session_id)) as sessions, form_submissions, MIN(timestamp) as timestamp FROM qudwa.action JOIN (SELECT visitor_id, COUNT(*) AS form_submissions, action_type FROM qudwa.action WHERE action_type = 'form' GROUP BY visitor_id , action_type) AS n ON n.visitor_id = action.visitor_id WHERE action.visitor_id = ?;"
    return this.execQuery(sqlQuery, [visitorId], logger.forms)
  }

  markSubmissionAsSeen (metadataId) {
    let sqlQuery = 'UPDATE request_metadata SET is_seen = 1 WHERE metadata_id = ?'
    return this.execQuery(sqlQuery, [metadataId], logger.forms)
  }

  insertRequestIntroSubmission (data) {
    let sqlQuery = 'INSERT INTO connection_request (mentor, type, name, email, mobile, dob, connect_through, social_account, introduction, contact_reason, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let values = [data.mentor, data.type, data.name, data.email, data.mobile, data.dob, data.connectThrough, data.socialAccount, data.introduction, data.contactReason, new Date()]
    // mentor, type, name, email, mobile, dob, comm_method, connect_through, profile, interests, introduction, contact_reason, timestamp, user_id

    return this.execQuery(sqlQuery, values, logger.forms)
  }

  insertRequestMeetingSubmission (data) {
    let sqlQuery = 'INSERT INTO connection_request (mentor, type, name, email, mobile, dob, comm_method, introduction, contact_reason, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let values = [data.mentor, data.type, data.name, data.email, data.mobile, data.dob, data.commMethod, data.introduction, data.contactReason, new Date()]
    return this.execQuery(sqlQuery, values, logger.forms)
  }

  insertJoinWhatsappSubmission (data) {
    let sqlQuery = 'INSERT INTO connection_request (mentor, type, name, email, mobile, dob, introduction, contact_reason, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let values = [data.mentor, data.type, data.name, data.email, data.mobile, data.dob, data.introduction, data.contactReason, new Date()]
    return this.execQuery(sqlQuery, values, logger.forms)
  }

  insertHelpSubmission (data) {
    let sqlQuery = 'INSERT INTO connection_request (type, name, email, mobile, dob, interests, introduction, contact_reason, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let values = [data.type, data.name, data.email, data.mobile, data.dob, data.interests, data.introduction, data.contactReason, new Date()]
    return this.execQuery(sqlQuery, values, logger.forms)
  }

  insertRecommendMentorSubmission (data) {
    let sqlQuery = 'INSERT INTO recommended_mentor (name, email, mobile, social_profiles, timestamp) VALUES (?, ?, ?, ?, ?)'
    let values = [data.name, data.email, data.mobile, JSON.stringify(data.social_profiles), new Date()]
    return this.execQuery(sqlQuery, values, logger.forms)
  }

  insertRequestMetaData (data) {
    let sqlQuery = 'INSERT INTO request_metadata (request_id, request_type, user_id, action_id, language, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
    let values = [data.requestId, data.type, data.userId, data.actionId, data.language, new Date()]
    return this.execQuery(sqlQuery, values, logger.forms)
  }

  /*
   *   _____ ____      _    ____ _  _______ ____
   *  |_   _|  _ \    / \  / ___| |/ / ____|  _ \
   *    | | | |_) |  / _ \| |   | ' /|  _| | |_) |
   *    | | |  _ <  / ___ \ |___| . \| |___|  _ <
   *    |_| |_| \_\/_/   \_\____|_|\_\_____|_| \_\
   */

  getAllActions (start, end) {
    let sqlQuery = 'SELECT action.*, session_count, page_count, first_visit FROM qudwa.action LEFT JOIN qudwa.visitor ON action.visitor_id = visitor.visitor_id WHERE timestamp <= ? AND timestamp >= ? ORDER BY timestamp DESC;'
    return this.execQuery(sqlQuery, [end, start], logger.tracking)
  }

  getActionsByVisitorId (visitorId, start, end) {
    let sqlQuery = 'SELECT action.*, session_count, page_count, first_visit FROM qudwa.action LEFT JOIN qudwa.visitor ON action.visitor_id = visitor.visitor_id WHERE action.visitor_id = ? AND timestamp <= ? AND timestamp >= ? ORDER BY timestamp DESC;'
    return this.execQuery(sqlQuery, [visitorId, end, start], logger.tracking)
  }

  getActionsWithTime (start, end) {
    let sqlQuery = 'SELECT count(*) as c , date(timestamp) AS d FROM qudwa.action WHERE timestamp <= ? AND timestamp >= ? GROUP BY d ORDER BY d DESC;'
    return this.execQuery(sqlQuery, [end, start], logger.tracking)
  }

  getVisitorsWithTime (start, end) {
    let sqlQuery = 'SELECT count(*) as c, d FROM (SELECT visitor_id, date(timestamp) as d FROM qudwa.action WHERE timestamp <= ? AND timestamp >= ? group by d, visitor_id order by d desc, visitor_id) as t group by d order by d desc;'
    return this.execQuery(sqlQuery, [end, start], logger.tracking)
  }

  getVisitorById (uid) {
    let sqlQuery = 'SELECT * FROM visitor WHERE visitor_id = ?'
    return this.execQuery(sqlQuery, [uid], logger.tracking)
  }

  getSessionById (sid, uid) {
    let sqlQuery = 'SELECT * FROM session WHERE session_id = ? AND visitor_id = ?'
    return this.execQuery(sqlQuery, [sid, uid], logger.tracking)
  }

  /**
   * Insert a new visitor
   * visitor_id, session_count, page_count, first_visit, extra_data}
   * @param {visitor_id, session_count, page_count, first_visit, extra_data} data - {visitor_id, session_count, page_count, first_visit, extra_data}
   */
  insertNewVisitor (data) {
    let sqlQuery = 'INSERT INTO visitor (visitor_id, session_count, page_count, first_visit, extra_data) VALUES (?, ?, ?, ?, ?)'
    let values = [data.visitorId, data.sessionCount || 1, data.pageCount || 1, new Date(), JSON.stringify(data.extraData || {})]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }

  /**
   * insert a new action
   * {action_id, visitor_id, action_type, url, action_data, language, extra_data, session_id, timestamp}
   * @param {action_id, visitor_id, action_type, url, action_data, language, extra_data, session_id, timestamp} data - {action_id, visitor_id, action_type, url, action_data, language, extra_data, session_id, timestamp}
   */
  insertAction (data) {
    let sqlQuery = 'INSERT INTO action (action_id, visitor_id, action_type, url, action_data, language, extra_data, session_id, timestamp, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    let values = [data.actionId, data.visitorId, data.actionType, data.url, data.actionData, data.language, JSON.stringify(data.extraData || {}), data.sessionId, new Date(), data.referrer]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }

  /**
   * Insert a new session
   * {session_id, visitor_id, start_time}
   * @param {session_id, visitor_id, start_time} data - {session_id, visitor_id, start_time}
   */
  insertSession (data) {
    let sqlQuery = 'INSERT INTO session (session_id, visitor_id, start_time) VALUES (?, ?, ?)'
    let values = [data.sessionId, data.visitorId, new Date()]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }

  updateVisitorExtraData (data) {
    if (Object.keys(data).length === 0) return
    let sqlQuery = 'UPDATE visitor SET extra_data = ? WHERE visitor_id = ?'
    let values = [data.extraData, data.visitorId]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }

  updateVisitorSessionCount (data) {
    if (Object.keys(data).length === 0) return
    let sqlQuery = 'UPDATE visitor SET session_count = session_count+1 WHERE visitor_id = ?'
    let values = [data.visitorId]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }

  updateVisitorPageCount (data) {
    if (Object.keys(data).length === 0) return
    let sqlQuery = 'UPDATE visitor SET page_count = page_count+1 WHERE visitor_id = ?'
    let values = [data.visitorId]
    return this.execQuery(sqlQuery, values, logger.tracking)
  }
}

const getPort = async () => {
  try {
    const response = await axios.get(process.env.DB_CHECK)
    const data = response.data
    let port
    for (let i = 0; i < data.data.length; i++) {
      if (data.data[i].name === process.env.DB_CONTAINER_NAME) {
        port = data.data[i].ports['3306']
        break
      }
    }
    return port
  } catch (error) {
    logger.forms.error(error)
  }
}

let dbHelper = new DbHelper()
module.exports = dbHelper
