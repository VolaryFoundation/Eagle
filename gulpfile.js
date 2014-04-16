
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
  //require('./app/server')
  var db = require('mongo-promise')
  var config = require('config')
  db.url = process.env.MONGOHQ_URL || config.servers.mongodb
  var groups = require('./app/types/group/group_type')
  db.entities.find({ type: 'group' }).then(function(entities) {
    groups.warmMany(entities)
  })
})
