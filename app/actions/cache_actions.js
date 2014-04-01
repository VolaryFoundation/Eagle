
var rsvp = require('rsvp')
var entityActions = require('./entity_actions')

module.exports = {
  
  refresh: function(entityId) {
    return new rsvp.Promise(function(res, rej) {
      db.cache.remove({ entityId: entityId }).then(function() {
        gatherer
      })
    })
  }
}
