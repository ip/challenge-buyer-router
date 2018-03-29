const http = require('http')
const { URL } = require('url')
const parseJsonBody = require('body/json')

const createRedisClient = require('./redis')
const buyers = require('./buyers')

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
  const url = new URL(req.url, 'http://localhost')

  if (url.pathname === '/') {
    rootRoute(req, res)
    return
  }

  if (req.method === 'POST' && url.pathname === '/buyers') {
    postBuyersRoute({ redis, req, res })
    return
  }

  {
    const match = url.pathname.match(/\/buyers\/(\w+)/)
    if (req.method === 'GET' && match) {
      const buyerId = match[1]
      getBuyersRoute({ redis, buyerId, res })
      return
    }
  }

  if (req.method === 'GET' && url.pathname === '/route') {
    const { searchParams } = url
    getRouteRoute({ redis, searchParams, res })
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
    if (err) {
      const message = 'Error parsing request body: ' + err.toString()
      return respondWithError(res, message)
    }

    buyers.put({ redis, buyer: data, cb: onBuyerSaved })
  })

  function onBuyerSaved (err) {
    if (err) return respondWithError(res, err)

    res.statusCode = 201
    respondWithSuccess(res)
  }
}

function getBuyersRoute ({ redis, buyerId, res }) {
  buyers.get({ redis, buyerId, cb: onBuyerRead })

  function onBuyerRead (err, buyer) {
    if (err) return respondWithError(res, err)

    res.statusCode = 200
    res.end(JSON.stringify(buyer))
  }
}

function getRouteRoute ({ redis, searchParams, res }) {
  const params = {
    timestamp: new Date(searchParams.get('timestamp')),
    device: searchParams.get('device'),
    state: searchParams.get('state')
  }

  buyers.route({ redis, params }, onLocationMatched)

  function onLocationMatched (err, location) {
    if (err) return respondWithError(res, err)

    res.statusCode = 302
    res.setHeader('location', location)
    respondWithSuccess(res)
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

function respondWithSuccess (res) {
  res.end('{"success": true}')
}
