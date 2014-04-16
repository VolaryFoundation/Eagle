
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

  // takes entity or cache
  warm: function(obj) {
    
    // skip warming if we are using a mock object
    if (obj.mock) return new rsvp.Promise(function(res) { res() })

    var gather = function(obj) {
      console.log('gathering ', obj)
      return gatherer.gather({
        refs: obj.refs,
        adapters: this.adapters
      }).then(function(data) {
        data._entityId = obj._id.toString()
        console.log('saving warmed data ', data)
        return db[this.collection].findAndModify({ _entityId: data._entityId }, null, data, { upsert: true, 'new':true }).then(function(doc) {
          console.log('save success')
          return doc
        }, function() { console.log('save fail') })
      }.bind(this), function() { console.log('ERROR: ', arguments) })
    }.bind(this)

    // if given a cache
    if (!obj.refs) {
      return db.entities.findById(obj._entityId).then(function(cache) {
        console.log('findbyid', obj._entityId, cache) 
        gather(cache)
      }, console.log)
    } else {
      return gather(obj)
    }
  },

  // takes cache
  isOutdated: function(obj) {
    if (!obj._meta || !obj._meta.fields) return true

    var now = Date.now() / 1000
    var expiries = _.pluck(_.flatten(_.values(obj._meta.fields)), 'expires')
    console.log('fields: ', _.values(_.flatten(obj._meta.fields)))
    console.log('now: ', now)
    console.log('expiries: ', expiries)
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
