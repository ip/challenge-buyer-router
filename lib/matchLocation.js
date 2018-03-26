module.exports = function matchLocation ({ redis, params }, cb) {
  redis.zrevrange('offersIndex', 0, -1, (err, offerIds) => {
    if (err) return cb(err)

    findFirstMatchingOffer({ redis, offerIds, params }, onOfferFound)
  })

  function onOfferFound (err, offer) {
    if (err) return cb(err)

    cb(null, offer.location)
  }
}

function findFirstMatchingOffer ({ redis, offerIds, params }, cb) {
  if (offerIds.length === 0) return cb('No matching offer found')

  const id = offerIds[0]

  redis.get(`offer:${id}`, (err, offerJson) => {
    if (err) return cb(err)

    const offer = JSON.parse(offerJson)
    if (doesOfferMatch(offer, params)) return cb(null, offer)

    return findFirstMatchingOffer({
      redis,
      offerIds: offerIds.slice(1),
      params
    }, cb)
  })
}

function doesOfferMatch (offer, params) {
  const { criteria } = offer

  return criteria.day.includes(params.timestamp.getUTCDay()) &&
    criteria.hour.includes(params.timestamp.getUTCHours()) &&
    criteria.device.includes(params.device) &&
    criteria.state.includes(params.state)
}
