const map = require('map-async')

// Reads buyer offers and unflattens them back
module.exports = function readBuyer ({ redis, buyerId, cb }) {
  redis.smembers(`buyer:${buyerId}:offers`, (err, offerIds) => {
    if (err) return cb(err)

    readOffers({ redis, offerIds, cb: onOffersRead })
  })

  function onOffersRead (err, offers) {
    if (err) return cb(err)

    const buyerNonFlat = {
      id: buyerId,
      offers,
    }

    cb(null, buyerNonFlat)
  }
}

function readOffers({ redis, offerIds, cb }) {
  map(offerIds, readOffer, cb)

  function readOffer (offerId, done) {
    redis.get(`offer:${offerId}`, (err, offerJson) => {
      if (err) done(err)

      let offer
      try {
        offer = JSON.parse(offerJson)
      } catch (err) {
        return done(err)
      }

      delete offer.id
      done(null, offer)
    })
  }
}
