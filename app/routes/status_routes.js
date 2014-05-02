module.exports = function(app) {

  app.get('/status', function(req, res) {
    res.send(200)
  })

}
