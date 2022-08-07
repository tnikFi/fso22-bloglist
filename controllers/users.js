const userRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
    const users = await User.find({})
    users.forEach(user => user.populate('blogs'))
    response.status(200).json(users)
})

userRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body

    if (password.length < 3) {
        return response.status(400).json({error: 'password must be 3 characters or longer'})
    }

    if (username.length < 3) {
        return response.status(400).json({error: 'username must be 3 characters or longer'})
    }

    const existingUser = await User.findOne({username})
    if (existingUser) {
        return response.status(400).json({error: 'username must be unique'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = userRouter