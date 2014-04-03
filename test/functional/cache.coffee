
request = require('supertest')
app = request(require('../../app/server'))
db = require('mongo-promise')
expect = require('expect.js')
groups = require('../../app/types/group_type')
_ = require('lodash')

jsonify = (obj) ->
  JSON.parse(JSON.stringify(obj))

addGroups = (configs, cb) ->
  db.cache.insert(_.extend({ _type: 'group', _entityId: 0 }, configs), { w: 1 }, cb)

describe 'Cache Functionality', ->

  beforeEach (done) ->
    db.getCollection('cache').then (coll) ->
      coll.drop()
      done()

  describe 'getting by id', ->
    
    it 'should return cache object', (done) ->
      db.entities.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.cache.insert({ _entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.get('/cache/' + cached._entityId)
            .expect(cached)
            .end(done)

  describe 'flushing by id', ->

    it 'should return remove the cache entry for given entity id', (done) ->
      db.entities.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.cache.insert({ _entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.del('/cache/' + cached._entityId)
            .end( ->
              db.cache.findById(cached._id).then (found) ->
                expect(found).to.be(null)
                done()
            )

  describe 'searching', ->

    it 'should say it is unprocessable without a type param', (done) ->
      app.get('/cache')
        .expect(422)
        .end(done)

    it 'should return an empty array for no results', (done) ->
      app.get('/cache?type=group')
        .expect(200, [])
        .end(done)


    describe 'keys', ->

      it 'should return a root level key', (done) ->
        groups.search({ keys: { name: 'bat' } }).then (arr) ->
          expect(arr.length).to.be(1)
          expect(arr[0].a.b).to.be('d')
          done()

      it 'should work on a nested key', (done) ->
        groups.search({ keys: { 'a.b': 'd' } }).then (arr) ->
          expect(arr.length).to.be(2)
          expect(arr[0].a.b).to.be('d')
          expect(arr[1].a.b).to.be('d')
          done()
