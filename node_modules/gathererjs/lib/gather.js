
var _ = require('lodash')
var rsvp = require('rsvp')
var util = require('./util')

module.exports = function(config) {

  var prefs = config.prefs || []
  var refs = config.refs
  var adapters = refs.map(function(ref) {
    return _.find(config.adapters, { name: ref.adapter })
  })

  var fetched = refs.map(function(ref, i) {
    return adapters[i].fetch(ref.id)
  })

  return rsvp.all(fetched).then(function(results) {
    return results.reduce(function(data, raw, i) {
      var built = util.buildForAdapter(adapters[i], raw)
      return _.reduce(built, function(data, v, k) {
        data[k] || (data[k] = [])
        var pref = _.find(prefs, { prop: k })
        if (pref && pref.adapter == adapters[i].name) {
          data[k].unshift(v)
        } else {
          data[k].push(v)
        }
        return data
      }, data)
    }, {})
  })
}
