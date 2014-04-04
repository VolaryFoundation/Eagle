var _ = require('lodash')

module.exports = function(normalized) {
  var name = normalized.name || '';
  var desc = normalized.description || '';
  normalized.keywords = _.compact((name + ' ' + desc).toLowerCase().split(/\s/).map(function(word) { return word.replace(/(\W)/g, '') }))
  return normalized
}
