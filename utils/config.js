var yaml = require('js-yaml')
var fs = require('fs')

const config = function () {
  try {
    var doc = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf-8'))
    console.log(doc)
    return doc
  } catch (e) {
    console.log(e)
    return null
  }
}

module.exports = config()
