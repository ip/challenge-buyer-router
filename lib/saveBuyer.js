module.exports = function saveBuyer ({ redis, buyer, cb }) {
  flattenBuyerOffers({ redis, buyer, cb: onBuyersFlattened })

  function onBuyersFlattened (err, { buyerFlat, offersFlat }) {
    if (err) return handleError(err)

    const multi = redis.multi()
    saveBuyerFlat(multi, buyerFlat)
    saveOffersFlat(multi, offersFlat)
    multi.exec(err => {
      if (err) return handleError(err)

      cb(null)
    })
  }

  function handleError (err) {
    cb('Error while writing buyer: ' + err.toString())
  }
}

function flattenBuyerOffers ({ redis, buyer, cb }) {
  const offersIncrement = buyer.offers.length

  redis.incrby('offersNum', offersIncrement, (err, newOffersNum) => {
    if (err) return cb(err)

    const oldOffersNum = newOffersNum - offersIncrement

    const offersFlat = buyer.offers.map((offer, i) => ({
      ...offer,
      id: oldOffersNum + i
    }))

    const buyerFlat = {
      id: buyer.id,
      offerIds: offersFlat.map(offer => offer.id)
    }

    cb(null, { buyerFlat, offersFlat })
  })
}

function saveBuyerFlat (multi, buyerFlat) {
  const { id } = buyerFlat

  multi.sadd('buyers', id)
    .sadd(`buyer:${id}:offers`, buyerFlat.offerIds)
}

function saveOffersFlat (multi, offersFlat) {
  offersFlat.forEach(offer => {
    multi.set(`offer:${offer.id}`, JSON.stringify(offer))
      // Index offers by price
      .zadd('offersIndex', offer.value, offer.id)
  })
}
