
var fs = require('fs')
var _ = require('lodash')

var files = fs.readdirSync(__dirname)
var types = files.filter(function(file) {
  return _.contains(file, 'type')
})

module.exports = function(names) {
  return types.reduce(function(memo, type) { 
    var requirePath = __dirname + '/' + type.split('.')[0]
    var name = type.split('_')[0]
    if (!names || names.indexOf(name) > -1) {
      memo[name] = require(requirePath)
    }
    return memo
  }, {})
}

