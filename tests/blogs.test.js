const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./blogs_test_helper')
const app = require('../app')

const api = supertest(app)

// Reset the test database before each test
beforeEach(async () => {
    await helper.setInitialState()
})

describe('when there are blogs in the database', () => {
    test('GET returns all blogs as JSON', async () => {
        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/application\/json/)
        expect(response.body).toHaveLength((await helper.blogsInDb()).length)
        
        if (response.body.length) {
            expect(response.body[0].id).toBeDefined()
        }
    })

    describe('adding a blog to the database', () => {
        test('increments the total blog count by 1', async () => {
            const likes = Math.round(Math.random()*20)
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example', likes: likes}
            
            const response = await api.post('/api/blogs').send(newBlog)
            expect(response.status).toBe(201)
    
            const getResponse = await api.get('/api/blogs')
            expect(getResponse.body).toHaveLength(helper.initialData.length + 1)
            expect(getResponse.body[getResponse.body.length-1]).toMatchObject(newBlog)
        })
    
        test('returns the added blog', async () => {
            const likes = Math.round(Math.random()*20)
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example', likes: likes}
            
            const response = await api.post('/api/blogs').send(newBlog)
            expect(response.body.title).toBe(newBlog.title)
            expect(response.body.url).toBe(newBlog.url)
            expect(response.body.likes).toBe(likes)
        })

        describe('without', () => {
            test('likes defaults to 0 likes', async () => {
                const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example'}
        
                const response = await api.post('/api/blogs').send(newBlog)
                expect(response.body.likes).toBeDefined()
                expect(response.body.likes).toBe(0)
            })

            test('title or url returns status 400', async () => {
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
    })

    describe('deleting a blog', () => {
        test('with a valid id returns status 204', async () => {
            const blogs = await helper.blogsInDb()
            const id = blogs[Math.round(Math.random()*(blogs.length-1))].id
            const response = await api.delete(`/api/blogs/${id}`)
            expect(response.status).toBe(204)
        })

        test('with a valid id removes the entry', async () => {
            const blogs = await helper.blogsInDb()
            const id = blogs[Math.round(Math.random()*(blogs.length-1))].id
            console.log('deleting id', id);
            await api.delete(`/api/blogs/${id}`)
            const afterDelete = await helper.blogsInDb()
            expect(afterDelete).toHaveLength(helper.initialData.length - 1)
        })
    })
})

afterAll(() => {
    mongoose.connection.close()
})