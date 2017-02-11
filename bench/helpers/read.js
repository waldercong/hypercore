var raf = require('random-access-file')
var path = require('path')
var hypercore = require('../../')

module.exports = function (dir, proof) {
  var feed = hypercore(function (name) {
    return raf(path.join(__dirname, '../cores', dir, name))
  })

  var then = Date.now()
  var size = 0
  var cnt = 0

  feed.ready(function () {
    var missing = feed.blocks
    var reading = 0

    for (var i = 0; i < 16; i++) read(null, null)

    function read (err, data) {
      if (err) throw err

      if (data) {
        reading--
        cnt++
        size += data.length
      }

      if (!missing) {
        if (!reading) {
          console.log(Math.floor(1000 * size / (Date.now() - then)) + ' bytes/s')
          console.log(Math.floor(1000 * cnt / (Date.now() - then)) + ' blocks/s')
        }
        return
      }

      missing--
      reading++

      var block = Math.floor(Math.random() * feed.blocks)

      if (proof) feed.proof(block, onproof)
      else onproof()

      function onproof () {
        feed.get(block, read)
      }
    }
  })
}
