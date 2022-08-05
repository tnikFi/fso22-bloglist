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
    })
})

afterAll(() => {
    mongoose.connection.close()
})