
var gatherer = require('../lib/gatherer')
var db = require('mongo-promise')
var _ = require('lodash')
var rsvp = require('rsvp')

module.exports = {

  warmMany: function(arr) {
    var obj = arr[0]
    if (!obj) return
    this.warm(obj).then(setTimeout(this.warmMany.bind(this, arr.slice(1)), 2000))
  },

  warm: function(obj) {
    if (!obj.refs.length) return new rsvp.Promise(function(res) { res() })

    return gatherer.gather({
      refs: obj.refs,
      adapters: this.adapters
    }).then(function(data) {
      data._entityId = obj._id.toString()
      return db[this.collection].findAndModify({ _entityId: obj._id }, null, data, { upsert: true, 'new':true }).then(function(doc) {
        return doc
      })
    }.bind(this), function() { console.log('ERROR: ', arguments) })
  },

  isOutdated: function(obj) {
    if (!obj._meta || !obj._meta.fields) return true

    var now = Date.now() / 1000
    var expiries = _.pluck(obj._meta.fields, 'expires')
    return _.any(expiries, function(exp) { return exp < now })
  },

  search: function(params) {

    var fields = params.fields
    var query = this.buildQuery(params.q || {})
    var opts = { skip: parseInt(params.skip || 0), limit: parseInt(params.limit || 500) }

    return db[this.collection].find(query, fields, opts).then(function(results) {
      _.filter(results, this.isOutdated).forEach(this.warm.bind(this))
      return results
    }.bind(this))
  },

  validateRefs: function(refs) {
    return refs.map(function(ref) {
      if (!this.adapters[ref.adapter].canUse(ref.id)) {
        ref.status = 'broken'
      }
      return ref
    }, this)
  }

}
