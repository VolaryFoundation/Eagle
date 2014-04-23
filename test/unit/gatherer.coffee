
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
