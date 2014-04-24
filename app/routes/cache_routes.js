
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
