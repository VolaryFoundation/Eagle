
request = require('supertest')
app = request(require('../../app/server'))
db = require('mongo-promise')
expect = require('expect.js')
crypto = require('crypto')

jsonify = (obj) ->
  JSON.parse(JSON.stringify(obj))

hash = (ts, authSecret) ->
  crypto.createHash('md5').update(ts + authSecret).digest('hex')

authorize = (key, secret) ->
  ts = Date.now().toString()
  obj = {
    authTimestamp: ts,
    authId: key,
    authSecret: secret,
    authHash: hash(ts, secret)
  }
  obj.toString =  -> "authId=#{@authId}&authHash=#{@authHash}&authTimestamp=#{@authTimestamp}"
  return obj

describe 'Entity Functionality', ->

  beforeEach (done) ->

    db.getCollection('clients').then (coll) ->
      coll.drop()
      coll.insert { authId: 'abc', authSecret: 'def' }, { w: 1 }, (e, client) ->
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

  describe 'validations', ->
    
    it 'should require type', (done) ->
      auth = authorize('abc', 'def')
      app.post('/entities?' + auth.toString()).send({})
        .expect((res) ->
          return 'Should have been missing type' unless (res.body.msg is 'Missing type')
        ).end(done)

    it 'should require recognized type', (done) ->
      auth = authorize('abc', 'def')
      app.post('/entities?' + auth.toString()).send({ type: 'foo' })
        .expect((res) ->
          return 'Should have not recognized type' unless res.body.msg is 'Unrecognized type'
        ).end(done)

    it 'should require refs', (done) ->
      auth = authorize('abc', 'def')
      app.post('/entities?' + auth.toString()).send({ type: 'group' })
        .expect((res) ->
          return 'Should have found refs missing' unless res.body.msg is 'Need at least one ref'
        ).end(done)

    it 'should require all refs to be "usable" by their adapter', (done) ->
      auth = authorize('abc', 'def')
      app.post('/entities?' + auth.toString()).send({
        type: 'group',
        refs: [ { adapter: 'facebook', id: 1 } ]
      }).expect((res) ->
        return 'Should have found facebook ref unusable' unless res.body.msg is 'Invalid ref'
      ).end(done)

    it 'should return ref as "broken" if it failed test', (done) ->
      auth = authorize('abc', 'def')
      app.post('/entities?' + auth.toString()).send({
        type: 'group',
        refs: [ { adapter: 'facebook', id: 1 } ]
      }).expect((res) ->
        return 'Should have found facebook ref status as "broken"' unless res.body.entity.refs[0].status is 'broken'
      ).end(done)

  describe 'creating', ->

    it 'should require auth', (done) ->
      app.post('/entities')
        .expect(401)
        .end(done)

    it 'should create', (done) ->
      auth = authorize('abc', 'def')
      console.log('about to create')
      app.post('/entities?' + auth.toString()).send({ refs: [], type: 'group' })
        .expect(201)
        .end(done)

    xit 'should cause cache to be built', (done) ->
      auth = authorize('abc', 'def')
      app
        .post('/entities?' + auth.toString())
        .send({
          refs: [ { adapter: 'foo', id: '1' } ], type: 'group'
        })
        .expect((res) ->
          
        ).end(done)

  describe 'updating', ->

    it 'should update', (done) ->
      console.log('about to updated')
      db.entities.insert({ mock: true, refs: [ { id: 'facebook.com/1', adapter: 'facebook' }, { id: 2, adapter: 'meetup' } ], type: 'group' }).then (inserted) ->
        auth = authorize('abc', 'def')
        modified = jsonify(inserted[0])
        modified.refs.pop()
        app.put('/entities/' + modified._id + '?' + auth.toString()).send(modified)
          .expect(modified)
          .end(done)

    xit 'should cause cache to be rebuilt', (done) ->

  describe 'blacklisting', ->

    xit 'should remove from entities collection', (done) ->
      db.entities.insert({}).then (inserted) ->
        doc = jsonify(inserted[0])
        auth = authorize('abc', 'def')
        app.del('/entities/' + doc._id + '?' + auth.toString())
          .end ->
            db.entities.findById(doc._id).then (found) ->
              expect(!found).to.be(true)
              done()

    xit 'should cause corrosponding cache to be deleted', (done) ->

##=========================================================================##
## This file is part of Eagle.                                             ##
##                                                                         ##
## Eagle is Copyright 2014 Volary Foundation and Contributors              ##
##                                                                         ##
## Eagle is free software: you can redistribute it and/or modify it under  ##
## the terms of the GNU Affero General Public License as published by the  ##
## Free Software Foundation, either version 3 of the License, or (at your  ##
## option) any later version.                                              ##
##                                                                         ##
## Eagle is distributed in the hope that it will be useful, but WITHOUT    ##
## ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or   ##
## FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public    ##
## License for more details.                                               ##
##                                                                         ##
## You should have received a copy of the GNU Affero General Public        ##
## License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.  ##
##=========================================================================##
