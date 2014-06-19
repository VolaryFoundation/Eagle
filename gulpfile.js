
var gulp = require('gulp')

gulp.task('warm-groups', function() {
  //require('./app/server')
  var db = require('mongo-promise')
  var config = require('config')
  db.url = process.env.MONGOLAB_URI || config.servers.mongodb
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
  db.url = process.env.MONGOLAB_URI || config.servers.mongodb
  var groupType = require('./app/types/group/group_type')
  db.shortcut('entities')

  db.entities.find({}, {}, { timeout: false }).then(function(groups) { 
    console.log('building groups count ', groups.length)

    console.log(groups.filter(function(group) { console.log(group._id.toString()); return group._id.toString() == '5344863f3779f96e5a920fcb' }))

    db.groups.find({ _entityId: { '$in': _.invoke(_.pluck(groups, '_id'), 'toString') } }, { _entityId: true }).then(function(cached) {
      console.log('found cached length ', cached.length)
      var entityIds = _.invoke(_.pluck(cached, '_entityId'), 'toString')
      var missing = groups.filter(function(group) { return !_.contains(entityIds, group._id.toString()) })
      console.log('warm many length', missing.length)
      groupType.warmMany(missing)
    }) 
  })
})

//===========================================================
// This file is part of Eagle.
//
// Eagle is Copyright 2014 Volary Foundation and Contributors
//
// Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
//===========================================================

