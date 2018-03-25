const http = require('http')
const parseJsonBody = require('body/json')

const createRedisClient = require('./redis')
const saveBuyer = require('./saveBuyer')

module.exports = function createServer () {
  const redis = setupRedis()
  const routeRequests_ = routeRequests.bind(null, redis)

  return http.createServer(routeRequests_)
}

function setupRedis () {
  const redis = createRedisClient()

  redis.on('error', function (err) {
    console.error('Error:', err)
  })

  return redis
}

function routeRequests (redis, req, res) {
  if (req.url === '/') {
    rootRoute(req, res)
  } else if (req.method === 'POST' && req.url === '/buyers') {
    postBuyersRoute({ redis, req, res })
  } else {
    defaultRoute(req, res)
  }
}

//  Routes

function rootRoute (req, res) {
  res.end('This is buyer router server')
}

function postBuyersRoute ({ redis, req, res }) {
  parseJsonBody(req, res, function (err, data) {
    if (err)
      return respondWithError(res, 'Error parsing request body: '
        + err.toString())

    saveBuyer({ redis, buyer: data, cb: onBuyerSaved })
  })

  function onBuyerSaved (err) {
    if (err) return respondWithError(res, err)

    res.statusCode = 201
    res.end('{"success": true}')
  }
}

function defaultRoute (req, res) {
  res.statusCode = 404
  res.statusMessage = 'Not found'
  res.end(res.statusMessage)
}

// Helper functions

function respondWithError (res, err) {
  res.statusCode = 400
  res.end(JSON.stringify({
    error: err.toString()
  }))
}
