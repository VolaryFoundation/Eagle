
var passport = require('passport')
var util = require('util')
var crypto = require('crypto')
var clientLib = require('./client')
var db = require('mongo-promise')
db.shortcut('clients')

function ClientKeyStrategy() { 
  this.name = 'client-key'
};

util.inherits(ClientKeyStrategy, passport.Strategy)

ClientKeyStrategy.prototype.authenticate = function(req, options) {

  var authId = req.param('authId')
  var authHash = req.param('authHash')
  var authTimestamp = req.param('authTimestamp')

  db.clients.find({ authId: authId }).then(function(client) {
    if (!client || !crypto.createHash('md5').update(timestamp, client.authSecret).digest('hex') === authHash) {
      return this.fail()
    }
    req.user = client
    this.pass()
  })
};

module.exports = ClientKeyStrategy;

