
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

  var db = require('mongo-promise')
  db.url = process.env.MONGOHQ_URL
  var groups = require('./app/types/group/group_type')
  db.shortcut('entities')

  db.entities.find({ type: 'group' }).then(function(groups) { 
    var ps = groups.map(function(group) { return db.groups.find({ _entityId: group._id.toString() }).then(function(groups) { return groups ? groups[0] : groups }) })
    rsvp.all(ps).then(function(results) {
      var missing = results.map(function(result, i) {
        if (!result) {
          return groups[i]; 
        }
      })
      groups.warmMany(missing)
    })
  })
})
