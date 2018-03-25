const http = require('http')
const parseJsonBody = require('body/json')

const createRedisClient = require('./redis')
const saveBuyer = require('./saveBuyer')
const readBuyer = require('./readBuyer')

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
    return
  }
  if (req.method === 'POST' && req.url === '/buyers') {
    postBuyersRoute({ redis, req, res })
    return
  }

  const match = req.url.match(/\/buyers\/(\w+)/)
  if (req.method === 'GET' && match) {
    const buyerId = match[1]
    getBuyersRoute({ redis, buyerId, res })
    return
  }

  defaultRoute(req, res)
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

function getBuyersRoute ({ redis, buyerId, res }) {
  readBuyer({ redis, buyerId, cb: onBuyerRead })

  function onBuyerRead (err, buyer) {
    if (err) return respondWithError(res, err)

    res.statusCode = 200
    res.end(JSON.stringify(buyer))
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
