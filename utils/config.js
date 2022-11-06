require('dotenv').config()

const getEnvConfig = () => {
    switch (process.env.NODE_ENV) {
        case 'test':
            return process.env.TEST_MONGODB_URI
        case 'development':
            return process.env.TEST_MONGODB_URI
        default:
            return process.env.MONGODB_URI
    }
}

const MONGODB_URI = getEnvConfig()

console.log(MONGODB_URI);

const PORT = process.env.PORT
const SECRET = process.env.SECRET

module.exports = {
    MONGODB_URI,
    PORT,
    SECRET
}