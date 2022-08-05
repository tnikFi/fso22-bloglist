const http = require('http')
const config = require('./utils/config')
const app = require('./app')
const logging = require('./utils/logging')

const server = http.createServer(app)

const PORT = config.PORT
server.listen(PORT, () => {
  logging.info(`Server running on port ${PORT}`)
})
