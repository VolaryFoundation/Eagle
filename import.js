var fs = require('fs')

fs.readFile('./refs.json', 'utf8', function(e, json) {
  var refs = JSON.parse(json).map(function(item) {
    return {
      refs: Object.keys(item.refs).map(function(name) {
        return { adapter: name, id: item.refs[name] }
      })
    }
  })

  fs.writeFile('refs.json', JSON.stringify(refs))
})
