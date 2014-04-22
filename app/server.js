
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
