var _ = require('lodash')
var rsvp = require('rsvp')
var synonyms = require('../../../lib/synonyms')
var request = require('request')
var cheerio = require('cheerio')

function downcase(val) {
  if (!val) return ''
  return val.toLowerCase()
}

var meetupAdapter = { 

  canUse: function(url) {
    return /atheistnexus\.com/.test(url)
  },

  getters: {

    name: function($) {
      return $('[property="og:title"]').attr('content')
    },

    website: function($) {
      var deets = $('.group_details').html()
      var link = deets.split('Website:')[1]
      if (!link) return
      var url = link.split('>')[1].split('<')[0]
      return url
    },

    description: function($) {
      return $('.group_details').children('div').first().text()
    },

    memberCount: function($) {
      var deets = $('.group_details').html()
      var el = deets.split('Members:')[1]
      if (!el) return
      var count = el.split('>')[1].split('<')[0]
      if (!count) return
      return parseInt(count)
    },

    images: function(raw) {
    }
  },

  normalize: function(raw) {
    if (!raw) return []
    return _.reduce(meetupAdapter.getters, function(memo, getter, key) {
      var value = getter(raw)
      if (value || (_.isBoolean(value) || _.isNumber(value))) memo[key] = value
      return memo
    }, {})
  },

  fetch: function(ref, props) {
    return new rsvp.Promise(function(res, rej) {
      var url = /^http/.test(ref) ? ref : 'http://' + ref
      request(url, function(e, response, body) {
        if (e) return res(null)

        var dom = cheerio.load(body)

        res({
          meta: { source: 'atheistnexus', expires: Math.round((Date.now() / 1000) + 172800) },
          normalized: this.normalize(dom),
          raw: {}
        })
        
      }.bind(this))
    }.bind(this))
  }
}

module.exports = meetupAdapter

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
