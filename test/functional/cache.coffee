
request = require('supertest')
app = request(require('../../app/server'))
db = require('mongo-promise')
expect = require('expect.js')
_ = require('lodash')

jsonify = (obj) ->
  JSON.parse(JSON.stringify(obj))

addGroups = (configs, cb) ->
  db.groups.insert(configs.map(_.extend.bind(_, { _type: 'group', _entityId: 0 })), { w: 1 }).then(cb)


describe 'Cache Functionality', ->

  beforeEach (done) ->
    db.getCollection('groups').then (coll) ->
      coll.drop()
      done()

  describe 'getting by id', ->
    
    it 'should return cache object', (done) ->
      db.groups.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.groups.insert({ _entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.get('/cache/' + cached._entityId + '?type=group')
            .expect(cached)
            .end(done)

  describe 'flushing by id', ->

    it 'should return remove the cache entry for given entity id', (done) ->
      db.entities.insert({}).then (inserted) ->
        entity = jsonify(inserted[0])
        db.groups.insert({ _entityId: entity._id }).then (inserted) ->
          cached = jsonify(inserted[0])
          app.del('/cache/' + cached._entityId + '?type=group')
            .end( ->
              db.groups.findById(cached._id).then (found) ->
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
        addGroups [ { name: 'bat', a: { b: 'd' } } ], (inserted) ->
          groups = jsonify(inserted)
          app.get('/cache?type=group&q[keys][name]=bat')
            .expect(groups)
            .end(done)

      it 'should work on a nested key', (done) ->
        addGroups [ { name: 'bat', a: { b: 'd' } } ], (inserted) ->
          groups = jsonify(inserted)
          app.get('/cache?type=group&q[keys][a.b]=d')
            .expect(groups)
            .end(done)

