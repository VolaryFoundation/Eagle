
var express = require('express')
var config = require('config')
var cors = require('cors')
var server = express()

require('mongo-promise').url = process.env.MONGOHQ_URL || config.servers.mongodb

server.use(express.bodyParser())
server.use(cors({ origin: '*' }))

require('./routes/entity_routes')(server)
require('./routes/cache_routes')(server)
require('./routes/client_routes')(server)

module.exports = server
