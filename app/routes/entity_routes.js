
var db = require('mongo-promise')
var types = require('../types/index')
var _ = require('lodash')
db.shortcut('entities')

var passport = require('passport');
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

  app.get('/entities/:id', function(req, res) {
    db.entities.findById(req.params.id).then(function(entity) {
      res.send(entity)
    }, function() {
      res.send(500)
    })
  })

  app.post('/entities', requireClientKey, function(req, res) {

    var error = validate(req.body)
    if (error) {
      return res.send(500, { msg: error, entity: req.body })
    }

    db.entities.insert(req.body).then(function(entity) {
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
      res.send(200, entity)
    }, function() {
      res.send(500)
    })
  })

  // remove entity and add to blacklist
  app.del('/entities/:id', requireClientKey, function(req, res) {
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
