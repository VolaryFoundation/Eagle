
var thenRedis = require('then-redis')

module.exports = {
  _driver: null,
  url: '',
  connect: function() {
    return this._driver || (this._driver = thenRedis.createClient(this.url))
  }
}
