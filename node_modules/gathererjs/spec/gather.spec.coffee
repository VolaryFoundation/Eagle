
gather = require '../lib/gather'
util = require('../lib/util')
rsvp = require 'rsvp'
_ = require('lodash')
expect = require('expect.js')

describe 'gather', ->

  adapter1 = null
  adapter2 = null
  opts1 = null

  beforeEach ->
    adapter1 =
      name: '1'
      getters:
        name: (raw) -> raw.name
        foo: -> 'bar'
      fetch: (id) ->
        util.passing({ name: 'name 1' })

    adapter2 =
      name: '2'
      getters:
        name: (raw) -> raw.name
        foo: -> 'bat'
      fetch: (id) ->
        util.passing({ name: 'name 2' })

    opts1 =
      adapters: [ adapter1, adapter2 ]
      refs: [
        { adapter: '1', id: '123' }
        { adapter: '2', id: '456' }
      ]

  it 'should gather asynchronously from given adapters', (done) ->

    gathered = gather(opts1)

    gathered.then (d) ->
      expect(d).to.eql({ name: [ 'name 1', 'name 2' ], foo: [ 'bar', 'bat' ] })
      done()

  it 'should gather with preferences for certain fields from certain adapters', (done) ->

    opts1.prefs = [
      { prop: 'foo', adapter: '2' }
    ]

    gathered = gather(opts1)
  
    gathered.then (d) ->
      expect(d).to.eql({ name: [ 'name 1', 'name 2' ], foo: [ 'bat', 'bar' ] })
      done()
