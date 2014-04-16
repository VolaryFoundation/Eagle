
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
  db.url = process.env.MONGOHQ_URL
  var groupType = require('./app/types/group/group_type')
  db.shortcut('entities')

  db.entities.find({ type: 'group' }, {}, { limit: 10 }).then(function(groups) { 
    var ps = groups.map(function(group, i) { return db.groups.find({ _entityId: group._id.toString() }) })
    rsvp.all(ps).then(function(results) {
      var missing = results.map(function(result, i) {
        if (!result[0]) {
          return groups[i]; 
        }
      }).filter(function(m) { return m })
      console.log('warming many ', missing)
      groupType.warmMany(missing)
    }, console.log)
  })
    
})
