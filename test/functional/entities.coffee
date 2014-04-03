
request = require('supertest')
app = request(require('../../app/server'))
db = require('mongo-promise')
expect = require('expect.js')

jsonify = (obj) ->
  JSON.parse(JSON.stringify(obj))

describe 'Entity Functionality', ->

  beforeEach (done) ->
    db.getCollection('entities').then (coll) ->
      coll.drop()
      db.getCollection('entities_bl').then (coll) ->
        coll.drop()
        done()

  describe 'getting bulk', ->

    it 'should return empty array when empty', (done) ->
      app.get('/entities')
        .expect([])
        .end(done)

    describe 'pagination', ->

      it 'should use default limit and skip', (done) ->
        db.entities.insert([ {}, {}, {}, {}, {} ]).then (inserted) ->
          app.get('/entities')
            .expect(jsonify(inserted))
            .end(done)

      it 'should respect skips', (done) ->
        db.entities.insert([ {}, {}, {}, {}, {} ]).then (inserted) ->
          app.get('/entities?skip=1')
            .expect(jsonify(inserted.slice(1)))
            .end(done)

      it 'should respect limits', (done) ->
        db.entities.insert([ {}, {}, {}, {}, {} ]).then (inserted) ->
          app.get('/entities?limit=1')
            .expect(jsonify(inserted.slice(0, 1)))
            .end(done)

  describe 'getting by id', ->

    it 'should find by id', (done) ->
      db.entities.insert({}).then (inserted) ->
        doc = jsonify(inserted[0])
        app.get('/entities/' + doc._id)
          .expect(doc)
          .end(done)

  describe 'creating', ->

    it 'should create', (done) ->
      app.post('/entities').send({ a: 1 })
        .expect(201)
        .end(done)

  describe 'updating', ->

    it 'should update', (done) ->
      db.entities.insert({ refs: [ { id: 1, adapter: 'fb' }, { id: 2, adapter: 'mu' } ] }).then (inserted) ->
        modified = jsonify(inserted[0])
        modified.refs.pop()
        app.put('/entities/' + modified._id).send(modified)
          .expect(modified)
          .end(done)

  describe 'blacklisting', ->

    it 'should remove from entities collection', (done) ->
      db.entities.insert({}).then (inserted) ->
        doc = jsonify(inserted[0])
        app.del('/entities/' + doc._id)
          .end ->
            db.entities.findById(doc._id).then (found) ->
              expect(!found).to.be(true)
              done()

