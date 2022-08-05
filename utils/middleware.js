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
        default:
            next(error)
    }
}

module.exports = {
    unknownEndpoint,
    errorHandler
}