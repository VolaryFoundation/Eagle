
var _ = require('lodash')
var rsvp = require('rsvp')
var db = require('./db')

var gatherer = require('./gatherer')
var adapters = require('./adapters/index')([ 'meetup', 'facebook', 'mockingbird', 'atheistnexus' ])
var keywordize = require('./keywordize')

var collection = db.collection('groups')

collection(function(coll) {
  coll.ensureIndex({ 'location.lng_lat': '2dsphere' }, function() {})
})

var fns = {

  buildComposite: function(props) {
    return _.reduce(props, function(memo, v, k) {
      memo[k] = (_.first(v || []) || {}).value
      if (k === 'tags' || k === 'images' || k === 'links') {
        memo[k] = _.uniq(_.flatten(v, 'value'))
      }
      return memo
    }, {})
  },

  buildProps: function(data) {
    return data.results.reduce(function(composite, result) {

      _.each(result.normalized, function(v, k) {
        (composite[k] || (composite[k] = [])).push({ value: v, source: result.meta.source, expires: result.meta.expires })
      })

      return composite
    }, {})
  },

  storeGathered: function(group, data) {
    var props = fns.buildProps(data)
    var composite = fns.buildComposite(props)
    return db.findAndModify('groups', { _id: db.id(group._id) }, null, { $set: _.extend(composite, { props: props }) }, { 'new': true })
  },

  warm: function(groups) {
    console.log('STARTING TO WARM - HEAPUSED: ', process.memoryUsage().heapUsed)
    function next(groups, i) {
      if (!groups[i]) return
      gatherer.run({
        adapters: adapters,
        props: '*',
        ref: groups[i]
      })
      .then(function(data) {
        console.log('STORING - HEAPUSED: ', process.memoryUsage().heapUsed)
        return fns.storeGathered.bind(null, groups[i])(data)
      })
      .then(function() { 
        console.log('NEXT - HEAPUSED: ', process.memoryUsage().heapUsed)
        next(groups, i + 1)
      })
    }
    next(groups, 0)
  },

  isOutdated: function(group) {
    if (!group.props || !_.keys(group.props).length) return true
    var times = _.pluck(_.map(_.values(group.props), _.first), 'expires')
    var now = Date.now() / 1000
    return _.any(times, function(time) { return time < now })
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
  },

  search: function(params) {

    var limit = parseInt(params.limit || 500)
    var skip = parseInt(params.skip || 0)
    var fields = params.fields
    var query = fns.buildQuery(params)
    var opts = { skip: skip, limit: limit }

    return db.find('groups', query, fields, opts).then(function(results) {
      fns.warm(_.filter(results, fns.isOutdated))
      return results
    })
  },

  updateRefs: function(query, urls) {

    var refs = gatherer.buildRefs(adapters, urls)

    var queryKey = _.keys(query)[0]
    var queryVal = _.values(query)[0]
    refs['refs.' + queryKey] = queryVal
    var refQuery = _.object(['refs.' + queryKey], [queryVal])

    return db.findAndModify('groups', refQuery, null, { $set: refs }, { upsert: true })
  },

  blacklist: function(id) {
    return db.findById('groups', id).then(function(group) {
      return db.remove('groups', id).then(function() {
        return db.insert('groupsBlacklist', group.refs)
      })
    })
  },

  allTags: function(params) {
    return new rsvp.Promise(function(res, rej) {
      db.find('groups', fns.buildQuery(params)).then(function(groups) {
        var tags = _.uniq(_.flatten(groups, 'tags'))
        res(tags)
      }, function(e) {
        res([]) 
      })
    })
  }
}

module.exports = fns
