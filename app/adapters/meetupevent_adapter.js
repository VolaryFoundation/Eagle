var _ = require('lodash')
var meetup = require('meetup-api')('4018302316e5252575cc51584ac')
var rsvp = require('rsvp')

var meetupEventAdapter = { 

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
      return {
        address: null,
        postal_code: null,
        city: raw.city,
        state: (raw.state || '').toLowerCase(),
        country: (raw.country || '').toLowerCase(),
        lng_lat: [ raw.lon, raw.lat ]
      }
    }
  },

  build: function(raw) {
    if (!raw) return []
    return _.reduce(this.getters, function(memo, getter, key) {
      memo[key] = getter(raw)
      return memo
    }, {})
  },

  parseId: function(id) {
    if (id.indexOf('meetup.com') > -1) {
      return id.replace(/\/$/, '').replace(/#.*/, '').split('/').pop()
    } else {
      return id
    }
  },

  discover: function(rawId, props) {
    var id = this.parseId(rawId)
    console.log('discovering meetup events for rawId: ', rawId, id)
    return new rsvp.Promise(function(res, rej) {
      return meetup.getEvents({ group_urlname: id }, function(e, data) {
        if (e) return res()

        res({
          meta: { source: 'meetupevent' },
          normalized: this.build(data.results[0]),
          raw: data.results[0]
        })
        
      }.bind(this))
    }.bind(this))
  }
}

module.exports = meetupEventAdapter

