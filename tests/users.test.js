const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./users_test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await helper.setInitialState()
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
            const users = await helper.getUsers()
            expect(users.length).toBe(helper.initialData.length + 1)
        })

        test('fails if username is too short', async () => {
            const userData = {username: 'aa', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('username must be 3 characters or longer')

            const users = await helper.getUsers()
            expect(users.length).toBe(helper.initialData.length)
        })

        test('fails if password is too short', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'aa'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('password must be 3 characters or longer')

            const users = await helper.getUsers()
            expect(users.length).toBe(helper.initialData.length)
        })

        test('fails if username is taken', async () => {
            const userData = {username: 'admin', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
            expect(response.body.error).toBe('username must be unique')

            const users = await helper.getUsers()
            expect(users.length).toBe(helper.initialData.length)
        })
    })

    describe('getting users', () => {
        test('returns array of all users', async () => {
            const response = await api.get('/api/users')
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toMatch(/application\/json/)
            expect(response.body.length).toBe(helper.initialData.length)
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

    describe.only('logging in', () => {
        test('without a username fails', async () => {
            const login = {password: 'password'}
            const response = await api.post('/api/login')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('incorrect username or password')
        })

        test('without a password fails', async () => {
            const login = {username: 'admin'}
            const response = await api.post('/api/login')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('incorrect username or password')
        })

        test('with an incorrect password fails', async () => {
            const login = {username: 'admin', password: 'incorrect'}
            const response = await api.post('/api/login')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('incorrect username or password')
        })

        test('with an incorrect username fails', async () => {
            const login = {username: 'notarealuser', password: 'password'}
            const response = await api.post('/api/login')
            expect(response.status).toBe(401)
            expect(response.body.error).toBe('incorrect username or password')
        })

        test('with correct info returns token', async () => {
            const login = {username: 'admin', password: 'password'}
            const response = await api.post('/api/login')
            expect(response.status).toBe(200)
            expect(response.body.token).toBeDefined()
        })
    })
})

afterAll(() => {
    mongoose.connection.close()
})