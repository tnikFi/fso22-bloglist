const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body

    if (!(username && password)) {
        return response.status(401).json({error: 'invalid username or password'})
    }

    const user = await User.findOne({username})
    const passwordCorrect = user ? await bcrypt.compare(password, user.passwordHash) : false

    if (!(user && passwordCorrect)) {
        return response.status(401).json({error: 'invalid username or password'})
    }

    const userData = {
        username: user.username,
        id: user.__id
    }

    const token = jwt.sign(userData, process.env.SECRET)

    response.status(200).json({
        token,
        username: user.username,
        name: user.name
    })
})

module.exports = loginRouter