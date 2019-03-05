const winston = require('winston')
const { format, transports } = winston
const { combine, timestamp, json } = format

const container = new winston.Container()

container.add('forms', {
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    json()
  ),
  transports: [
    new transports.File({
      filename: 'forms_failed_queries.log'
    }),
    new transports.File({ filename: 'forms_error.log', level: 'error' }),
    new transports.Console({ level: 'error', format: format.simple() })
  ]
})

container.add('tracking', {
  level: 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    json()
  ),
  transports: [
    new transports.File({
      filename: 'tracking_failed_queries.log'
    }),
    new transports.File({ filename: 'tracking_error.log', level: 'error' }),
    new transports.Console({ level: 'error', format: format.simple() })
  ]
})

const logger = {
  forms: container.get('forms'),
  tracking: container.get('tracking')
}

module.exports = logger
