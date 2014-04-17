var _ = require('lodash')
var rsvp = require('rsvp')
var http = require('http')
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
      return _.extend(raw.location, { state: state, country: country })
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
      var req = http.get(MB_ROOT + '/groups/' + id, function(resp) {
      
        var str = ''
        resp.on('data', function(data) { str += data.toString() })

        resp.on('end', function() {
          if (!str) return res(null)

          // incase some stupid response comes back
          try {
            var data = JSON.parse(str)
          } catch(e) {
            return res(null)
          }

          console.log('fetched from mb', data)
          res({
            meta: { source: 'mockingbird', expires: Math.round((Date.now() / 1000) + 172800) },
            raw: data
          })
        }.bind(this))

      }.bind(this))

      req.on('error', function(e) {
        res(null)
      })
    }.bind(this))
  }
}

module.exports = mockingbirdAdapter
