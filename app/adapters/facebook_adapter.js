var _ = require('lodash')
var facebook = require('fbgraph')
var rsvp = require('rsvp')
var https = require('https')
var synonyms = require('../synonyms')
var withKeywords = require('../keywordize')

facebook.setAccessToken('CAACzKUBNQswBAJZCN3FB7TeCPRCRkCjCXtZBSlOnpzEA5OJi0WvL2ZBYgqS0kPFKiEsRVNZCVqZA8oRvNzOObC1k4jxs4bJSTloSW0ZCTyTG4KQalqCZBzPlZCK7fRWslUsYOC3UxHP6ZCp2m6gdtKAalF5ymVoOQGHevRzW4DLwGNnw1iuFaOCQd')
    
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

  normalize: function(raw) {
    if (!raw) return []
    return _.reduce(facebookAdapter.getters, function(memo, getter, key) {
      var value = getter(raw)
      if (value || (_.isBoolean(value) || _.isNumber(value))) memo[key] = value
      return memo
    }, {})
  },

  parseId: function(id) {
    if (id.indexOf('facebook.com') > -1) {
      return id.replace(/\/$/, '').replace(/#.*/, '').replace(/\?.*/, '').split('/').pop()
    } else {
      return id
    }
  },

  fetch: function(url, props) {
    return new rsvp.Promise(function(res, rej) {
      var id = this.parseId(url)
      try {
        facebook.get('/' + id, function(e, data) {

          if (e) data = {}

          res({
            meta: { source: 'facebook', expires: Math.round((Date.now() / 1000) + 172800) },
            normalized: this.aggregate(this.normalize(data)),
            raw: data
          })

        }.bind(this))
      } catch(e) {
        res(null)
      }
    }.bind(this))
  },

  test: function(cb) {
    facebook.get('/AtheistsUnited', cb)
  }
}

module.exports = facebookAdapter


