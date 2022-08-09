const mongoose = require('mongoose')
const supertest = require('supertest')
const blogsHelper = require('./blogs_test_helper')
const usersHelper = require('./users_test_helper')
const app = require('../app')

const api = supertest(app)

// Reset the test database before each test
beforeEach(async () => {
    await blogsHelper.setInitialState()
    await usersHelper.setInitialState()
})

describe('when there are blogs in the database', () => {
    test('GET / returns all blogs as JSON', async () => {
        const response = await api.get('/api/blogs')

        expect(response.status).toBe(200)
        expect(response.headers['content-type']).toMatch(/application\/json/)
        expect(response.body).toHaveLength((await blogsHelper.blogsInDb()).length)
        
        if (response.body.length) {
            expect(response.body[0].id).toBeDefined()
        }
    })

    test('GET /:id returns a single blog', async () => {
        const id = await blogsHelper.getRandomEntryId()
        const response = await api.get(`/api/blogs/${id}`)
        expect(response.status).toBe(200)
        expect(response.body.id).toBeDefined()
    })

    test('GET with an unused but valid id returns status 404', async () => {
        const response = await api.get(`/api/blogs/000000000000`)
        expect(response.status).toBe(404)
    })

    test('GET with invalid id returns status 400', async () => {
        const response = await api.get(`/api/blogs/a`)
        expect(response.status).toBe(400)
    })

    describe('adding a blog to the database', () => {
        test.only('requires a token', async () => {
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example'}

            const response = await api.post('/api/blogs').set('authorization', 'bearer not a real token').send(newBlog)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('invalid token')
        })

        test('increments the total blog count by 1', async () => {
            const likes = Math.round(Math.random()*20)
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example', likes: likes}
            
            const response = await api.post('/api/blogs').send(newBlog)
            expect(response.status).toBe(201)
    
            const getResponse = await api.get('/api/blogs')
            expect(getResponse.body).toHaveLength(blogsHelper.initialData.length + 1)
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

        test('will attach user info to the blog', async () => {
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example'}
            const response = await api.post('/api/blogs').send(newBlog)
            expect(response.body.user).toBeDefined()
            expect(response.body.user.id).toBeDefined()
            expect(response.body.user.name).toBeDefined()
            expect(response.body.user.username).toBeDefined()
            expect(response.body.user.passwordHash).not.toBeDefined()
        })

        test('will attach the blog to the user data', async () => {
            const newBlog = {title: 'The History of Testing', url: 'http://www.historyoftesting.example'}
            const response = await api.post('/api/blogs').send(newBlog)
            const user = await api.get(`/api/users/${response.body.user.id}`)
            expect(user.body.blogs).toBeDefined()
            expect(user.body.blogs[0].id).toBeDefined()
            expect(user.body.blogs[0].id).toBe(response.body.id)
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
            const id = await blogsHelper.getRandomEntryId()
            const response = await api.delete(`/api/blogs/${id}`)
            expect(response.status).toBe(204)
        })

        test('with a valid id removes the entry', async () => {
            const id = await blogsHelper.getRandomEntryId()
            await api.delete(`/api/blogs/${id}`)
            const afterDelete = await blogsHelper.blogsInDb()
            expect(afterDelete).toHaveLength(blogsHelper.initialData.length - 1)
        })
    })

    describe('editing', () => {
        test('an existing blog works', async () => {
            const id = await blogsHelper.getRandomEntryId()
            const newData = {title: 'Blog of Editing', author: 'Editor', url: 'https://www.editedblog.example'}
            const response = await api.put(`/api/blogs/${id}`).send(newData)
            expect(response.status).toBe(200)
            expect(response.body.title).toBe(newData.title)
            expect(response.body.author).toBe(newData.author)
            expect(response.body.url).toBe(newData.url)

            const verifyResponse = await api.get(`/api/blogs/${id}`)
            expect(verifyResponse.body.title).toBe(response.body.title)
        }),

        test('with an invalid id returns status 400', async () => {
            const newData = {title: 'Blog of Editing', author: 'Editor', url: 'https://www.editedblog.example'}
            const response = await api.put(`/api/blogs/a`).send(newData)
            expect(response.status).toBe(400)
        })

        test('with invalid data returns status 400', async () => {
            const id = await blogsHelper.getRandomEntryId()
            const newData = {title: null}
            const response = await api.put(`/api/blogs/${id}`).send(newData)
            expect(response.status).toBe(400)
        })
    })
})

describe('when the users database has users in it', () => {
    describe('creating a user', () => {
        test('returns the new user object', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(201)
            expect(response.body.id).toBeDefined()
        })

        test('will not return sensitive info', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.body.passwordHash).not.toBeDefined()
            expect(response.body.password).not.toBeDefined()
        })

        test('adds the user to the database', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'mypasswordisthis'}
            await api.post('/api/users').send(userData)
            const users = await usersHelper.getUsers()
            expect(users.length).toBe(usersHelper.initialData.length + 1)
        })

        test('fails if username is too short', async () => {
            const userData = {username: 'aa', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('username must be 3 characters or longer')

            const users = await usersHelper.getUsers()
            expect(users.length).toBe(usersHelper.initialData.length)
        })

        test('fails if password is too short', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'aa'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('password must be 3 characters or longer')

            const users = await usersHelper.getUsers()
            expect(users.length).toBe(usersHelper.initialData.length)
        })

        test('fails if username is taken', async () => {
            const userData = {username: 'admin', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('username must be unique')

            const users = await usersHelper.getUsers()
            expect(users.length).toBe(usersHelper.initialData.length)
        })
    })

    describe('getting users', () => {
        test('returns array of all users', async () => {
            const response = await api.get('/api/users')
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toMatch(/application\/json/)
            expect(response.body.length).toBe(usersHelper.initialData.length)
            expect(response.body[0].username).toBeDefined()
            expect(response.body[0].name).toBeDefined()
            expect(response.body[0].id).toBeDefined()
        })

        test('also contains the blogs added by each user', async () => {
            const response = await api.get('/api/users')
            expect(response.body[0].blogs).toBeDefined()
        })
        
        test('does not return password hashes', async () => {
            const response = await api.get('/api/users')
            expect(response.body[0].passwordHash).not.toBeDefined()
        })
    })

    describe('logging in', () => {
        test('without a username fails', async () => {
            const login = {password: 'password'}
            const response = await api.post('/api/login').send(login)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('invalid username or password')
        })

        test('without a password fails', async () => {
            const login = {username: 'admin'}
            const response = await api.post('/api/login').send(login)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('invalid username or password')
        })

        test('with an incorrect password fails', async () => {
            const login = {username: 'admin', password: 'incorrect'}
            const response = await api.post('/api/login').send(login)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('invalid username or password')
        })

        test('with an incorrect username fails', async () => {
            const login = {username: 'notarealuser', password: 'password'}
            const response = await api.post('/api/login').send(login)
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('invalid username or password')
        })

        test('with correct info returns token', async () => {
            const login = {username: 'test123', name: 'Jest Test', password: 'password'}
            await api.post('/api/users').send(login)
            const response = await api.post('/api/login').send(login)
            expect(response.status).toBe(200)
            expect(response.body.token).toBeDefined()
        })
    })
})

afterAll(() => {
    mongoose.connection.close()
})