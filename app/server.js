
var express = require('express')
var config = require('config')
var cors = require('cors')
var db = require('mongo-promise')
var server = express()
var rsvp = require('rsvp')
var redis = require('./lib/redis')

rsvp.on('error', console.log.bind(console, 'ERROR: '))

redis.url = process.env.REDISTOGO_URL || config.servers.redis
db.url = process.env.MONGOLAB_URI || config.servers.mongodb

server.use(express.bodyParser())
server.use(cors({ origin: '*' }))

require('./routes/index')(server)

module.exports = server

//===========================================================
// This file is part of Eagle.
//
// Eagle is Copyright 2014 Volary Foundation and Contributors
//
// Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
//===========================================================
