const logging = require('./logging')
const jwt = require('jsonwebtoken')
const config = require('./config')
const User = require('../models/user')

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
    logging.error(error.message)

    switch (error.name) {
        case 'CastError':
            return response.status(400).send({error: 'malformatted id'})
        case 'ValidationError':
            return response.status(400).json({error: error.message})
        case 'JsonWebTokenError':
            return response.status(401).json({error: 'invalid token'})
        default:
            next(error)
    }
}

const userExtractor = async (request, response, next) => {
    const auth = request.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decoded = jwt.verify(auth.substring(7), config.SECRET)
        if (!decoded.id) return logging.error('invalid token')
        request.user = await User.findById(decoded.id.toString())
    }
    next()
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    userExtractor
}