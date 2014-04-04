
var fs = require('fs')
var _ = require('lodash')

var files = fs.readdirSync(__dirname).filter(function(file) {
  return _.contains(file, 'route')
})

module.exports = function(app) {
  files.forEach(function(routes) { 
    var requirePath = __dirname + '/' + routes.split('.')[0]
    require(requirePath)(app)
  })
}
