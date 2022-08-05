const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    return blog ? response.json(blog) : response.status(404).end()
})

blogRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogRouter