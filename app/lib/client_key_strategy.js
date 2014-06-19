
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

    if (!client || crypto.createHash('md5').update(authTimestamp).update(client.authSecret).digest('hex') != authHash) {
      return this.fail()
    }
    req.user = client
    this.pass()
  }.bind(this))
};

module.exports = ClientKeyStrategy;


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
