
var express = require('express')
var config = require('config')
var cors = require('cors')
var db = require('mongo-promise')
var server = express()

db.url = process.env.MONGOHQ_URL || config.servers.mongodb

server.use(express.bodyParser())
server.use(cors({ origin: '*' }))

require('./routes/index')(server)

module.exports = server
