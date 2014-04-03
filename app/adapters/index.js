
var fs = require('fs')
var _ = require('lodash')

var files = fs.readdirSync(__dirname)
var adapters = files.filter(function(file) {
  return _.contains(file, 'adapter')
})

module.exports = function(names) {
  return adapters.reduce(function(memo, adapter) { 
    var requirePath = __dirname + '/' + adapter.split('.')[0]
    var name = adapter.split('_')[0]
    if (names.indexOf(name) > -1) {
      memo[name] = require(requirePath)
    }
    return memo
  }, {})
}
