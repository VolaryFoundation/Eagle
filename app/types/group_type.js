
var adapters = require('../adapters/index')([ 'atheistnexus', 'facebook', 'meetup' ])
var db = require('mongo-promise')

module.exports = {

  search: function(params) {

    var fields = params.fields
    var query = this.buildQuery(params.q || {})
    var opts = { skip: parseInt(params.skip || 0), limit: parseInt(params.limit || 500) }

    return db.cache.find(query, fields, opts).then(function(results) {
      //fns.warm(_.filter(results, fns.isOutdated))
      return results
    })
  },

  buildQuery: function(params) {

    var query = {}

    if (params.keywords) {
      var keywords = keywordize({ name: params.keywords }).keywords
      query['keywords'] = { $in: keywords }
    }
    if (params.sizes) query.size = { $in: params.sizes }
    if (params.ranges) query.range = { $in: params.ranges }
    if (params.geo) query["location.lng_lat"] = { $near: { $geometry: { type: 'Point', coordinates: [ parseFloat(params.geo[0]), parseFloat(params.geo[1]) ] } }, $maxDistance: parseFloat(params.geo[2]) }

    if (params.tags) {
      query.tags = {}
      var tagsArray = _.pairs(params.tags)
      var tagsOn = tagsArray.filter(function(arr) { return arr[1] == '1' }).map(_.first)
      var tagsOff = tagsArray.filter(function(arr) { return arr[1] == '2' }).map(_.first)
      if (!_.isEmpty(tagsOn)) query.tags.$in = tagsOn
      if (!_.isEmpty(tagsOff)) query.tags.$nin = tagsOff
    }

    if (params.keys) {
      _.extend(query, _.reduce(params.keys, function(memo, v, k) { memo[k] = v.toLowerCase(); return memo; }, {}))
    }

    return query
  }
}
