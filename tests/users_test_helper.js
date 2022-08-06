const User = require('../models/user')

const initialData = []

const setInitialState = async () => {
    await User.deleteMany({})
    const users = initialData.map(user => new User(user))
    const promises = users.map(user => user.save())
    await Promise.all(promises)
}

const getUsers = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialData,
    setInitialState,
    getUsers
}