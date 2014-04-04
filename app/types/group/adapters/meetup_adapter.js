var _ = require('lodash')
var meetup = require('meetup-api')('4018302316e5252575cc51584ac')
var rsvp = require('rsvp')
var withKeywords = require('../../../lib/keywordize')
var synonyms = require('../../../lib/synonyms')

function downcase(val) {
  if (!val) return ''
  return val.toLowerCase()
}

var meetupAdapter = { 

  canUse: function(url) {
    return /meetup.com\/[\w-_]+(\/)?$/.test(url)
  },

  aggregate: function(normalized) {
    return withKeywords(normalized)
  },

  getters: {

    name: function(raw) {
      return raw.name
    },

    website: function(raw) {
      return raw.link
    },

    description: function(raw) {
      return raw.description
    },

    location: function(raw) {
      if (!raw.city && !raw.state && !raw.country) return
      return {
        address: '',
        postal_code: '',
        city: downcase(raw.city),
        state: synonyms('states', raw.state),
        country: synonyms('countries', raw.country),
        lng_lat: [ raw.lon, raw.lat ]
      }
    },

    memberCount: function(raw) {
      if (raw.members && raw.members.length) return raw.members
    },

    images: function(raw) {
      if (!raw.photos) return
      return _.pluck(raw.photos, 'photo_link')
    },

    tags: function(raw) {
      if (!raw.topics) return
      return raw.topics.map(function(topic) { return topic.name.toLowerCase() })
    }
  },

  parseId: function(id) {
    if (id.indexOf('meetup.com') > -1) {
      return id.replace(/\/$/, '').replace(/#.*/, '').split('/').pop()
    } else {
      return id
    }
  },

  fetch: function(rawId, props) {
    var id = this.parseId(rawId)
    return new rsvp.Promise(function(res, rej) {
      return meetup.getGroups({ group_urlname: id }, function(e, data) {
        if (e) return res(null)

        res({
          meta: { source: 'meetup', expires: Math.round((Date.now() / 1000) + 172800) },
          raw: data.results[0]
        })
        
      }.bind(this))
    }.bind(this))
  }
}

module.exports = meetupAdapter

