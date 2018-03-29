const http = require('http')
const { URL } = require('url')

const api = require('./api')

module.exports = () => http.createServer(routeRequests)

function routeRequests (req, res) {
  const url = new URL(req.url, 'http://localhost')

  if (url.pathname === '/') {
    api.root(req, res)
    return
  }

  if (req.method === 'POST' && url.pathname === '/buyers') {
    api.postBuyers(req, res)
    return
  }

  {
    const match = url.pathname.match(/\/buyers\/(\w+)/)
    if (req.method === 'GET' && match) {
      const buyerId = match[1]
      api.getBuyers(res, buyerId)
      return
    }
  }

  if (req.method === 'GET' && url.pathname === '/route') {
    const { searchParams } = url
    api.route(res, searchParams)
    return
  }

  api.notFound(req, res)
}
