
var db = require('mongo-promise')
var types = require('../types/index')
var _ = require('lodash')
db.shortcut('entities')

var passport = require('passport')
var ClientKeyStrategy = require('../lib/client_key_strategy')
passport.use(new ClientKeyStrategy)
var requireClientKey = passport.authenticate('client-key');

function validate(entity) {
  if (!entity.type) return 'Missing type'
  var type = types[entity.type]
  if (!type) return 'Unrecognized type'
  if (!entity.refs) return 'Need at least one ref'
  entity.refs = type.validateRefs(entity.refs) // side-effect
  if (_.any(entity.refs, { status: 'broken' })) {
    return 'Invalid ref'
  }
}

module.exports = function(app) {

  app.get('/entities', function(req, res) {
    limit = parseInt(req.query.limit || 20)
    skip = parseInt(req.query.skip || 0)
    db.entities.find({}, null, { limit: limit, skip: skip }).then(function(entities) {
      res.send(entities)
    }, function() {
      res.send(500)
    })
  })
  
  //Requires adapterid query. Need to update this.
  app.get('/entities/search', function(req, res) {
    db.entities.findByAdapterId(req.query.adapterid).then(function(entity) {
      entity ? res.send(entity) : res.send(404)
    }, function() {
      res.send(500)
    })
  })

  app.get('/entities/:id', function(req, res) {
    db.entities.findById(req.params.id).then(function(entity) {
      entity ? res.send(entity) : res.send(404)
    }, function() {
      res.send(500)
    })
  })

  app.post('/entities', requireClientKey, function(req, res) {
    var error = validate(req.body)
    if (error) {
      return res.send(500, { msg: error, entity: req.body })
    }

    db.entities.insert(req.body).then(function(entities) {
      var entity = entities[0]
      types[entity.type].warm(entity)
      res.send(201, entity)
    }, function() {
      res.send(500)
    })
  })

  app.put('/entities/:id', requireClientKey, function(req, res) {

    var error = validate(req.body)
    if (error) {
      return res.send(500, { msg: error, entity: req.body })
    }

    db.entities.update({ _id: req.params.id }, req.body).then(function(entity) {
      types[entity.type].warm(entity)
      res.send(200, entity)
    }, function() {
      res.send(500)
    })
  })

  // remove entity and add to blacklist
  app.del('/entities/:id', requireClientKey, function(req, res) {
    console.log('trying to remove entity')
    db.entities.find({ _id: req.params.id }).then(function(entity) {
      db.entities.remove({ _id: req.params.id })
      db.getCollection('entities_bl').then(function(coll) {
        coll.insert(entity, function() {
          res.send(200) 
        })
      })
    })
  })
}

//=========================================================================//
// This file is part of Eagle.                                             //
//                                                                         //
// Eagle is Copyright 2014 Volary Foundation and Contributors              //
//                                                                         //
// Eagle is free software: you can redistribute it and/or modify it under  //
// the terms of the GNU Affero General Public License as published by the  //
// Free Software Foundation, either version 3 of the License, or (at your  //
// option) any later version.                                              //
//                                                                         //
// Eagle is distributed in the hope that it will be useful, but WITHOUT    //
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or   //
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public    //
// License for more details.                                               //
//                                                                         //
// You should have received a copy of the GNU Affero General Public        //
// License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.  //
//=========================================================================//
