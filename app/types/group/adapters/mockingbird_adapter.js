var _ = require('lodash')
var rsvp = require('rsvp')
var request = require('request')
var withKeywords = require('../../../lib/keywordize')
var synonyms = require('../../../lib/synonyms')
var CONFIG = require('config').servers;

var MB_ROOT = CONFIG.mockingbird + 'api'

var mockingbirdAdapter = {

  canUse: function(id) {
    return /\w+/.test(id)
  },

  aggregate: function(normalized) {
    return withKeywords(normalized)
  },

  getters: {

    name: function(raw) {
      return raw.name
    },

    description: function(raw) {
      return raw.description
    },

    location: function(raw) {
      if (!raw.location || (!raw.location.state && !raw.location.country)) return
      var state = synonyms('states', raw.location.state)
      var country = synonyms('countries', raw.location.country)
      var city = (raw.location.city || '').toLowerCase()
      return _.extend(raw.location, { state: state, country: country, city: city })
    },

    range: function(raw) {
      return raw.range
    },

    size: function(raw) {
      return raw.size
    },

    images: function(raw) {
      return raw.images
    },

    links: function(raw) {
      return raw.links
    },

    tags: function(raw) {
      return raw.tags
    }
  },

  normalize: function(raw) {
    if (!raw) return {}
    return _.reduce(mockingbirdAdapter.getters, function(memo, getter, key) {
      var value = getter(raw)
      if (value || (_.isBoolean(value) || _.isNumber(value))) memo[key] = value
      return memo
    }, {})
  },

  fetch: function(id, props) {
    console.log('fetching from MB ', id)
    return new rsvp.Promise(function(res, rej) {
      request(MB_ROOT + '/groups/' + id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res({
            meta: { source: 'mockingbird', expires: Math.round((Date.now() / 1000) + 172800) },
            raw: typeof body == 'string' ? JSON.parse(body) : body
          })
        } else {
          res(null)
        }
      })
    }.bind(this))
  }
}

module.exports = mockingbirdAdapter

//===========================================================
// This file is part of Eagle.
//
// Eagle is Copyright 2014 Volary Foundation and Contributors
//
// Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
//===========================================================
