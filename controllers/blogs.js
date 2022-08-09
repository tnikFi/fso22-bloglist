const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Blog = require('../models/blog.js')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user')
    return blog ? response.json(blog) : response.status(404).end()
})

blogRouter.post('/', async (request, response) => {
    const token = jwt.verify(request.token, config.SECRET)

    // If there is no token or the verified token has no id, return 401
    if (!request.token || !token.id) return response.status(401).json({error: 'token missing or invalid'})

    const user = await User.findOne({})
    const blog = new Blog({...request.body, user})
    const result = await blog.save()
    await user.update({blogs: user.blogs ? [...user.blogs, blog] : [blog]})
    response.status(201).json(result)
})

blogRouter.put('/:id', async (request, response) => {
    const {title, author, url, likes} = request.body
    const result = await Blog.findByIdAndUpdate(request.params.id, {title, author, url, likes}, { new: true, runValidators: true, context: 'query' })
    response.json(result)
})

blogRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogRouter