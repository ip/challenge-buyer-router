const createServer = require('./server')

const PORT = 5000

{
  const server = createServer()

  server.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
  })
}
