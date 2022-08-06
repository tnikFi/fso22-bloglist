const User = require('../models/user')

const initialData = [
    {
        _id: "62ee3765e94e10e2f2ed5df3",
        username: "user123",
        name: "Account Owner",
        passwordHash: "$2b$10$HkLYXe7TofHQDyRYrc3FueZPP9aS1QNDhe7W4i3TVHnTewDLxrkAS",
        __v: 0
    },
    {
        _id: "62ee3765e94e10e2f2ed5ccc",
        username: "admin",
        name: "John Doe",
        passwordHash: "$2b$10$HkLYXe7TofHQDyRYrc3FueZPP9aS1QNDhe7W4i3TVHnTewDLxrkAS",
        __v: 0
    },
]

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