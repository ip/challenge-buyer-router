const parseJsonBody = require('body/json')

const buyers = require('./buyers')()

module.exports = { root, postBuyers, getBuyers, route, notFound }

function root (req, res) {
  res.end('This is buyer router server')
}

function postBuyers (req, res) {
  parseJsonBody(req, res, function (err, data) {
    if (err) {
      const message = 'Error parsing request body: ' + err.toString()
      return respondWithError(res, message)
    }

    buyers.put(data, onBuyerSaved)
  })

  function onBuyerSaved (err) {
    if (err) return respondWithError(res, err)

    res.statusCode = 201
    respondWithSuccess(res)
  }
}

function getBuyers (res, buyerId) {
  buyers.get(buyerId, onBuyerRead)

  function onBuyerRead (err, buyer) {
    if (err) return respondWithError(res, err)

    res.statusCode = 200
    res.end(JSON.stringify(buyer))
  }
}

function route (res, searchParams) {
  const params = {
    timestamp: new Date(searchParams.get('timestamp')),
    device: searchParams.get('device'),
    state: searchParams.get('state')
  }

  buyers.route(params, onLocationMatched)

  function onLocationMatched (err, location) {
    if (err) return respondWithError(res, err)

    res.statusCode = 302
    res.setHeader('location', location)
    respondWithSuccess(res)
  }
}

function notFound (req, res) {
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
