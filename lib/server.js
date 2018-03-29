const http = require('http')
const { URL } = require('url')

const createRedisClient = require('./redis')
const api = require('./api')

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
    api.root(req, res)
    return
  }

  if (req.method === 'POST' && url.pathname === '/buyers') {
    api.postBuyers(req, res, redis)
    return
  }

  {
    const match = url.pathname.match(/\/buyers\/(\w+)/)
    if (req.method === 'GET' && match) {
      const buyerId = match[1]
      api.getBuyers(res, buyerId, redis)
      return
    }
  }

  if (req.method === 'GET' && url.pathname === '/route') {
    const { searchParams } = url
    api.route(res, searchParams, redis)
    return
  }

  api.notFound(req, res)
}
