const logging = require('./logging')

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

const tokenExtractor = (request, response, next) => {
    const auth = request.get('authorization')
    logging.info(auth);
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        request.token = auth.substring(7)
    }
    next()
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}