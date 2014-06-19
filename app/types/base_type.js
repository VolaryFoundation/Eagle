
var gatherer = require('../lib/gatherer')
var db = require('mongo-promise')
var _ = require('lodash')
var rsvp = require('rsvp')

module.exports = {

  warmMany: function(arr) {
    var obj = arr[0]
    if (!obj) return
    this.warm(obj)
    setTimeout(function() {
      this.warmMany(arr.slice(1))
    }.bind(this), 2000)
  },

  // takes entity or cache
  warm: function(obj) {
    
    // skip warming if we are using a mock object
    if (obj.mock) return new rsvp.Promise(function(res) { res() })

    var gather = function(obj) {
      return gatherer.gather({
        refs: obj.refs,
        adapters: this.adapters,
        prefs: obj.prefs
      }).then(function(data) {
        data._entityId = obj._id.toString()
        data._refs = obj.refs
        return db[this.collection].findAndModify({ _entityId: data._entityId }, null, data, { upsert: true, 'new':true }).then(function(doc) {
          return doc
        }, function() { console.log('save fail') })
      }.bind(this), function() { console.log('ERROR: ', arguments) })
    }.bind(this)

    // if given a cache
    if (!obj.refs) {
      return db.entities.findById(obj._entityId).then(function(cache) {
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
    return _.any(expiries, function(exp) { return exp < now })
  },

  search: function(params) {

    var fields = params.fields
    var query = this.buildQuery(params.q || {})
    var opts = { skip: parseInt(params.skip || 0), limit: parseInt(params.limit || 500) }

    return db[this.collection].find(query, fields, opts).then(function(results) {
      //_.filter(results, this.isOutdated).forEach(this.warm.bind(this))
      return results
    }.bind(this))
  },

  validateRefs: function(refs) {
    return refs.map(function(ref) {
      if (!this.adapters[ref.adapter] || !this.adapters[ref.adapter].canUse(ref.id)) {
        ref.status = 'broken'
      }
      return ref
    }, this)
  }
}

//=========================================================================//
// This file is part of Eagle.                                             //
//                                                                         //
// Eagle is Copyright 2014 Volary Foundation and Contributors              //
//                                                                         //
// Eagle is free software: you can redistribute it and/or modify it under  //
// the terms of the GNU Affero General Public License as published by the  //
// Free Software Foundation, either version 3 of the License, or (at your  //
// option) any later version.                                              //
//                                                                         //
// Eagle is distributed in the hope that it will be useful, but WITHOUT    //
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or   //
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public    //
// License for more details.                                               //
//                                                                         //
// You should have received a copy of the GNU Affero General Public        //
// License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.  //
//=========================================================================//
