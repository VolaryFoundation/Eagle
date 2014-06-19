
gatherer = require('../../app/lib/gatherer')
rsvp = require('rsvp')
expect = require('expect.js')

describe 'gatherer', ->

  passing = (val) ->
    new rsvp.Promise (res, rej) ->
      res(val)

  describe 'prefs', ->

    it 'should add prefs as the first element in props array', (done) ->
      adapters = {
        one: {
          getters: {
            a: (obj) -> obj.a
          },
          fetch: -> passing({ meta: {}, raw: { a: 'foo' } })
        },
        two: {
          getters: {
            a: (obj) -> obj.a
          },
          fetch: -> passing({ meta: {}, raw: { a: 'bar' } })
        }
      }
      gatherer.gather({
        adapters: adapters,
        prefs: { a: 'two' },
        refs: [ { adapter: 'one', id: 1 }, { adapter: 'two', id: 2 } ]
      }).then (data) ->
        expect(data.a).to.be('bar')
        done()

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

