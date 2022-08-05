const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./blogs_test_helper')
const app = require('../app')

const api = supertest(app)

// Reset the test database before each test
beforeEach(async () => {
    await helper.setInitialState()
})

describe('/api/blogs', () => {
    test('GET returns correct result', async () => {
        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/application\/json/)
        expect(response.body).toHaveLength((await helper.blogsInDb()).length)
        
        if (response.body.length) {
            expect(response.body[0].id).toBeDefined()
        }
    })

    test('POST adds a blog to the database', async () => {
        const likes = Math.round(Math.random()*20)
        const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example', likes: likes}
        
        const response = await api.post('/api/blogs').send(newBlog)
        expect(response.status).toBe(201)

        const getResponse = await api.get('/api/blogs')
        expect(getResponse.body).toHaveLength(helper.initialData.length + 1)
        expect(getResponse.body[getResponse.body.length-1]).toMatchObject(newBlog)
    })

    test('POST returns the added blog', async () => {
        const likes = Math.round(Math.random()*20)
        const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example', likes: likes}
        
        const response = await api.post('/api/blogs').send(newBlog)
        expect(response.body.title).toBe(newBlog.title)
        expect(response.body.url).toBe(newBlog.url)
        expect(response.body.likes).toBe(likes)
    })

    test('POST likes default to 0', async () => {
        const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example'}

        const response = await api.post('/api/blogs').send(newBlog)
        expect(response.body.likes).toBeDefined()
        expect(response.body.likes).toBe(0)
    })

    test('POST with invalid data returns 400', async () => {
        const empty = {}
        const noName = {url: 'http://www.historyoftesting.example'}
        const noUrl = {title: 'The History of Testing'}
        
        const emptyResponse = await api.post('/api/blogs').send(empty)
        const noNameResponse = await api.post('/api/blogs').send(noName)
        const noUrlResponse = await api.post('/api/blogs').send(noUrl)
        
        expect(emptyResponse.status).toBe(400)
        expect(noNameResponse.status).toBe(400)
        expect(noUrlResponse.status).toBe(400)
    })
})

afterAll(() => {
    mongoose.connection.close()
})