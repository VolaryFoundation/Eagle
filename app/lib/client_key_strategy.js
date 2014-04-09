
var passport = require('passport')
var util = require('util')
var crypto = require('crypto')
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

  if (!authId || !authHash || !authTimestamp) return this.fail()

  db.clients.find({ authId: authId }).then(function(clients) {
    var client = clients[0]
    if (!client || !crypto.createHash('md5').update(authTimestamp, client.authSecret).digest('hex') === authHash) {
      return this.fail()
    }
    req.user = client
    this.pass()
  }.bind(this))
};

module.exports = ClientKeyStrategy;
