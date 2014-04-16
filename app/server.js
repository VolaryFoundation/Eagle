
var express = require('express')
var config = require('config')
var cors = require('cors')
var db = require('mongo-promise')
var server = express()
var rsvp = require('rsvp')

rsvp.on('error', console.log.bind(console, 'ERROR: '))

db.url = process.env.MONGOHQ_URL || config.servers.mongodb

server.use(express.bodyParser())
server.use(cors({ origin: '*' }))

require('./routes/index')(server)

module.exports = server
