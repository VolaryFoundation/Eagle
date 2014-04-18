
var gulp = require('gulp')

gulp.task('warm-groups', function() {
  //require('./app/server')
  var db = require('mongo-promise')
  var config = require('config')
  db.url = process.env.MONGOHQ_URL || config.servers.mongodb
  var groups = require('./app/types/group/group_type')
  db.groups.find().then(function(caches) {
    groups.warmMany(caches.filter(groups.isOutdated))
  })
})

gulp.task('build-groups', function() {

  var _ = require('lodash')
  var db = require('mongo-promise')
  var rsvp = require('rsvp')
  var config = require('config')
  db.url = process.env.MONGOHQ_URL || config.servers.mongodb
  var groupType = require('./app/types/group/group_type')
  db.shortcut('entities')

  db.entities.find({}, {}, { timeout: false }).then(function(groups) { 
    console.log('building groups count ', groups.length)

    console.log(groups.filter(function(group) { console.log(group._id.toString()); return group._id.toString() == '5344863f3779f96e5a920fcb' }))

    db.groups.find({ _entityId: { '$in': _.invoke(_.pluck(groups, '_id'), 'toString') } }, { _entityId: true }).then(function(cached) {
      console.log('found cached length ', cached.length)
      var entityIds = _.invoke(_.pluck(cached, '_entityId'), 'toString')
      var missing = groups.filter(function(group) { return _.contains(entityIds, group._id.toString()) })
      console.log('warm many length', missing.length)
      groupType.warmMany(missing)
    }) 
  })
})
