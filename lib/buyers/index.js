;['get', 'put', 'route'].forEach(method => {
  module.exports[method] = require(`./${method}`)
})
