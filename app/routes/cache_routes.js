
var db = require('mongo-promise')
var types = require('../types/index')

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

  app.get('/cache/:id', function(req, res) {
    var type = types[req.query.type]
    db[type.collection].find({ _entityId: req.params.id }).then(function(result) {
      res.send(result[0])
    }, function() {
      res.send(500)
    })
  })

  app.del('/cache/:id', function(req, res) {
    var type = types[req.query.type]
    db.entities.findById(req.params.id).then(type.warm.bind(type))
    db[type.collection].remove({ _entityId: req.params.id }).then(function() {
      res.send(200)
    }, function() {
      res.send(500)
    })
  })
}
