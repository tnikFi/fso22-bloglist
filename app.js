const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blogs')
const config = require('./utils/config')
const {unknownEndpoint, errorHandler} = require('./utils/middleware')

const MONGODB_URI = config.MONGODB_URI
mongoose.connect(MONGODB_URI)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogRouter)

app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app