const createRedisClient = require('../redis')

module.exports = function createBuyersModel () {
  const redis = setupRedis()
  const model = {}

  ;['get', 'put', 'route'].forEach(method => {
    model[method] = require(`./${method}`)(redis)
  })

  return model
}

function setupRedis () {
  const redis = createRedisClient()

  redis.on('error', function (err) {
    console.error('Error creating Redis client:', err)
  })

  return redis
}
