const http = require('http')
const config = require('./utils/config')
const app = require('./app')

const server = http.createServer(app)

const PORT = config.PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
