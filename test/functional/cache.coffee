
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

    describe 'fields', ->

      it 'should not break with fields', (done) ->
        app.get('/cache?type=group&fields[name]=true')
          .expect(200)
          .end(done)

    describe 'keys', ->

      it 'should return a root level key', (done) ->
        addGroups [ { name: 'bat', a: { b: 'd' }, mock: true } ], (inserted) ->
          groups = jsonify(inserted)
          app.get('/cache?type=group&q[keys][name]=bat')
            .expect(groups)
            .end(done)

      it 'should work on a nested key', (done) ->
        addGroups [ { name: 'bat', a: { b: 'd' }, mock: true } ], (inserted) ->
          groups = jsonify(inserted)
          app.get('/cache?type=group&q[keys][a.b]=d')
            .expect(groups)
            .end(done)

##===========================================================
## This file is part of Eagle.
##
## Eagle is Copyright 2014 Volary Foundation and Contributors
##
## Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
##
## Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
##===========================================================
