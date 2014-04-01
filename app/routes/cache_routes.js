
var db = require('mongo-promise')

db.shortcut('cache')

module.exports = function(app) {

  app.get('/cache', function(req, res) {
    actions.search(req.params.q || {}).then(function(results) {
      res.send(results)
    }, function() {
      res.send(500) 
    })
  })

  app.get('/cache/:id', function(req, res) {
    db.cache.find({ entityId: req.params.id }).then(function(result) {
      res.send(result[0])
    }, function() {
      res.send(500)
    })
  })

  app.del('/cache/:id', function(req, res) {
    db.cache.remove({ entityId: req.params.id }).then(function() {
      res.send(200)
    }, function() {
      res.send(500)
    })
  })
}
