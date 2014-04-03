
var db = require('mongo-promise')
var types = require('../types/index')()

db.shortcut('cache')

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
    db.cache.find({ _entityId: req.params.id }).then(function(result) {
      res.send(result[0])
    }, function() {
      res.send(500)
    })
  })

  app.del('/cache/:id', function(req, res) {
    db.cache.remove({ _entityId: req.params.id }).then(function() {
      res.send(200)
    }, function() {
      res.send(500)
    })
  })
}
