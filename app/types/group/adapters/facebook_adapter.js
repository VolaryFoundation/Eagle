
var _ = require('lodash')
var facebook = require('fbgraph')
var rsvp = require('rsvp')
var https = require('https')
var synonyms = require('../../../lib/synonyms')
var withKeywords = require('../../../lib/keywordize')

facebook.setAccessToken('196989753836236|Z34vb_B1-WpG7SxsfJbqsgHYPVA')

function downcase(val) {
  if (!val) return ''
  return val.toLowerCase()
}

var facebookAdapter = { 

  canUse: function(url) {
    return /facebook.com/.test(url)
  },

  aggregate: function(normalized) {
    return withKeywords(normalized)
  },

  getters: {

    name: function(raw) {
      return raw.name
    },

    links: function(raw) {
      if (!raw.website && !raw.link) return
      return _.compact([ raw.website, raw.link ])
    },

    images: function(raw) {
      if (!raw.cover) return ''
      return [ raw.cover.source ]
    },

    description: function(raw) {
      return raw.description || raw.about || raw.mission || raw.general_info
    },

    location: function(raw) {
      var venue = raw.location || {}
      if (!venue.longitude) {  return; }
      return {
        address: venue.street,
        city: downcase(venue.city),
        state: synonyms('states', venue.state),
        country: synonyms('countries', venue.country),
        zip: venue.zip,
        lng_lat: [ venue.longitude, venue.latitude ]
      }
    }
  },

  parseId: function(id) {
    if (id.indexOf('facebook.com') > -1) {
      return id.replace(/\/$/, '').replace(/#.*/, '').replace(/\?.*/, '').split('/').pop()
    } else {
      return id
    }
  },

  fetch: function(url, props) {
    var id = this.parseId(url)
    return new rsvp.Promise(function(res, rej) {
      facebook.get('/' + id, function(e, data) {

        if (e || !data) { return res(null) }
        else {
          res({
            meta: { source: 'facebook', expires: Math.round((Date.now() / 1000) + 172800) },
            raw: data
          })
        }
      })
    })
  },

  test: function(cb) {
    facebook.get('/AtheistsUnited', cb)
  }
}

module.exports = facebookAdapter

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
