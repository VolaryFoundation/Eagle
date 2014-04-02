
var _ = require('lodash')
var rsvp = require('rsvp')

module.exports = {

  failing: function(error) {
    return new rsvp.Promise(function(res, rej) { rej() })
  },

  passing: function(data) {
    return new rsvp.Promise(function(res, rej) { res(data) })
  },

  buildForAdapter: function(adapter, raw) {
    return _.reduce(adapter.getters, function(memo, v, k) {
      memo[k] = v(raw)
      return memo
    }, {})
  }
}
