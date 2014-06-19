
var db = require('mongo-promise')
var types = require('../types/index')
var redis = require('../lib/redis').connect()

module.exports = function(app) {

  app.get('/cache', function(req, res) {

    var type = types[req.query.type]
    if (!type) return res.send(422)

    type.search(req.query).then(function(results) {
      res.send(results)
    }, function() {
      res.send(500) 
    })
  })

  app.get('/cache/aggregation', function(req, res) {

    var type = types[req.query.type]
    if (!type) return res.send(422)

    var prop = 'aggregation-' + req.query.prop
    redis.get(prop).then(function(val) {
      if (val) {
        res.send(JSON.parse(val))
      } else {
        type['aggregate-' + req.query.prop]().then(function(val) {
          redis.set(prop, JSON.stringify(val)).then(function() {
            res.send(val)
          })
        })
      }
    }, function(e) {
      console.log('error in redis', e)
    })
  })

  app.get('/cache/:id', function(req, res) {

    var type = types[req.query.type]
    if (!type) return res.send(422)

    db[type.collection].find({ _entityId: req.params.id }).then(function(result) {
      if (!result[0] || req.query.refresh) {
        return db.entities.findById(req.params.id)
          .then(type.warm.bind(type))
          .then(res.send.bind(res, 200))
      } else {
        res.send(result[0])
      }
    }, function() {
      res.send(500)
    })
  })

  app.del('/cache/:id', function(req, res) {

    var type = types[req.query.type]
    if (!type) return res.send(422)

    db.entities.findById(req.params.id).then(type.warm.bind(type))
    db[type.collection].remove({ _entityId: req.params.id }).then(function() {
      res.send(200)
    }, function() {
      res.send(500)
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
