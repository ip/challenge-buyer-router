const http = require('http')

module.exports = () => http.createServer(routeRequests)

function routeRequests (req, res) {
  if (req.url === '/') {
    rootRoute(req, res)
  } else if (req.method === 'POST' && req.url === '/buyers') {
    postBuyersRoute(req, res)
  } else {
    defaultRoute(req, res)
  }
}

function rootRoute (req, res) {
  res.end('This is buyer router server')
}

function postBuyersRoute (req, res) {
  res.end('This is /buyers route')
}

function defaultRoute (req, res) {
  res.statusCode = 404
  res.statusMessage = 'Not found'
  res.end(res.statusMessage)
}
