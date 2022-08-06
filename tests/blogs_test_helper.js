const Blog = require('../models/blog')

const initialData = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        user: "62ee3765e94e10e2f2ed5df3"
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        user: "62ee3765e94e10e2f2ed5df3"
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        user: "62ee3765e94e10e2f2ed5df3"
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        user: "62ee3765e94e10e2f2ed5ccc"
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        user: "62ee3765e94e10e2f2ed5ccc"
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        user: "62ee3765e94e10e2f2ed5ccc"
    }
]

const setInitialState = async () => {
    await Blog.deleteMany({})
    const blogs = initialData.map(blog => new Blog(blog))
    const promises = blogs.map(blog => blog.save())
    await Promise.all(promises)
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const getRandomEntryId = async () => {
    const blogs = await blogsInDb()
    return blogs[Math.round(Math.random()*(blogs.length-1))].id
}

module.exports = {
    initialData,
    setInitialState,
    blogsInDb,
    getRandomEntryId
}