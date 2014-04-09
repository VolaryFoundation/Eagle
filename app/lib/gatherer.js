
var _ = require('lodash')
var rsvp = require('rsvp')

var util = {

  failing: function(error) {
    return new rsvp.Promise(function(res, rej) { rej() })
  },

  passing: function(data) {
    return new rsvp.Promise(function(res, rej) { res(data) })
  },

  buildForAdapter: function(adapter, raw) {
    return _.reduce(adapter.getters, function(memo, v, k) {
      var val = v(raw)
      if (val != null) {
        memo[k] = val
      }
      return memo
    }, {})
  }
}

module.exports = {

  gather: function(config) {

    var prefs = config.prefs || []
    var refs = config.refs
    var adapters = refs.map(function(ref) {
      return _.find(config.adapters, function(v, k) {
        return k == ref.adapter 
      })
    })

    console.log('FETCH?????')
    var fetched = refs.map(function(ref, i) {
      console.log('gonna fetch ref????', ref, adapters[i])
      return adapters[i].fetch(ref.id)
    })

    console.log('fetching....')
    return rsvp.all(fetched).then(function(results) {
      console.log('fetched ', results)
      return results.reduce(function(data, result, i) {
        var built = util.buildForAdapter(adapters[i], result.raw)
        return _.reduce(built, function(data, v, k) {
          var preferred = false

          if (!data._meta.fields[k]) data._meta.fields[k] = []

          if (typeof data[k] === 'undefined') {
            data[k] = v
          }

          var pref = _.find(prefs, { prop: k })
          if (pref && pref.adapter == adapters[i].name) {
            data[k] = v
            preferred = true
          }

          data._meta.fields[k][ preferred ? 'unshift' : 'push' ]({
            expires: result.meta.expires,  
            source: result.meta.source,
            value: built[k]
          })

          return data
        }, data)
      }, { _meta: { fields: {} } })
    })
  }

}
