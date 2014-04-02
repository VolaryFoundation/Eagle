
expect = require 'expect.js'
util = require '../lib/util'

describe "util module", ->

  describe '.passing', ->

    it 'should return a passing promise', (done) ->
      util.passing().then ->
        expect(true).to.be(true)
        done()

  describe '.failing', ->

    it 'should return a failing promise', (done) ->
      util.failing().fail ->
        expect(true).to.be(true)
        done()

  describe '.buildForAdapter', ->

    it 'should normalize via getter methods', ->
      built = util.buildForAdapter({
        getters: {
          foo: (raw) -> raw.foo.charAt(0)
        }
      }, { foo: 'bar' })
      expect(built).to.eql({ foo: 'b' })
