
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

    var prefs = config.prefs || {}
    var refs = config.refs
    var adapters = refs.map(function(ref) {
      var found = _.find(config.adapters, function(v, k) {
        return k == ref.adapter 
      })
      found.name = ref.adapter
      return found
    })

    // if there is an eronious ref in there (missing adapter)
    // just return a passing promise.. we will filter it out
    // in the rsvp.all
    var fetched = refs.map(function(ref, i) {
      return adapters[i] ? adapters[i].fetch(ref.id) : util.passing()
    })

    return rsvp.all(fetched).then(function(results) {
      return results.reduce(function(data, result, i) {
        if (!result || !result.raw) return data;

        var built = util.buildForAdapter(adapters[i], result.raw)
        return _.reduce(built, function(data, v, k) {
          var preferred = false

          if (!data._meta.fields[k]) data._meta.fields[k] = []

          if (typeof data[k] === 'undefined') {
            data[k] = v
          }

          var pref = prefs[k]
          console.log('checking pref', pref, prefs, k, adapters[i].name)
          if (pref && pref == adapters[i].name) {
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
