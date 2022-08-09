const blogRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
})

blogRouter.get('/:id', async (request, response) => {
    console.log('get');
    const blog = await Blog.findById(request.params.id).populate('user')
    return blog ? response.json(blog) : response.status(404).end()
})

blogRouter.post('/', async (request, response) => {
    // If there is no token, return 401
    if (!request.user) return response.status(401).json({error: 'token missing or invalid'})

    const user = request.user
    const blog = new Blog({...request.body, user})
    const result = await blog.save()
    await User.findByIdAndUpdate(user.id.toString(), {blogs: user.blogs ? [...user.blogs, blog] : [blog]})
    response.status(201).json(result)
})

blogRouter.put('/:id', async (request, response) => {
    // If there is no token, return 401
    if (!request.user) return response.status(401).json({error: 'token missing or invalid'})

    const blog = await Blog.findById(request.params.id)
    
    // If the blog does not exist, return 404
    if (!blog) return response.status(404).json({error: 'not found'})
    // If the user id does not match the user id in the blog entry, don't allow editing
    if (!(blog.user.toString() === request.user.id.toString())) return response.status(401).json({error: 'token missing or invalid'})

    const {title, author, url, likes} = request.body
    const result = await Blog.findByIdAndUpdate(request.params.id, {title, author, url, likes}, { new: true, runValidators: true, context: 'query' })
    response.json(result)
})

blogRouter.delete('/:id', async (request, response) => {
    // If there is no token, return 401
    if (!request.user) return response.status(401).json({error: 'token missing or invalid'})

    const blog = await Blog.findById(request.params.id)

    // If the blog does not exist, return 404
    if (!blog) return response.status(404).json({error: 'not found'})

    console.log('blog found');

    // If the user id does not match the user id in the blog entry, don't allow deletion
    if (!(blog.user.toString() === request.user.id.toString())) return response.status(401).json({error: 'token missing or invalid'})

    await blog.delete()

    response.status(204).end()
})

module.exports = blogRouter