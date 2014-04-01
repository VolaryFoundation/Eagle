
request = require('supertest')
app = request(require('../../app/server'))
db = require('mongo-promise')
expect = require('expect.js')

jsonify = (obj) ->
  JSON.parse(JSON.stringify(obj))

describe 'Cache Functionality', ->

  beforeEach (done) ->
    db.getCollection('cache').then (coll) ->
      coll.drop()
      done()

  describe 'search', ->

    it 'should return empty array when empty', (done) ->
      app.get('/cache')
        .expect([])
        .end(done)

  describe 'getting by id', ->
    
    it 'should return cache object', (done) ->
      db.entities.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.cache.insert({ entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.get('/cache/' + cached.entityId)
            .expect(cached)
            .end(done)

  describe 'flushing by id', ->

    it 'should return remove the cache entry for given entity id', (done) ->
      db.entities.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.cache.insert({ entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.del('/cache/' + cached.entityId)
            .end( ->
              db.cache.findById(cached._id).then (found) ->
                expect(found).to.be(null)
                done()
            )
