const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./users_test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await helper.setInitialState()
})

describe('when the users database has users in it', () => {
    describe.only('creating a user', () => {
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
        })

        test('fails if password is too short', async () => {
            const userData = {username: 'test_user', name: 'Jest Test', password: 'aa'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
        })

        test('fails if username is taken', async () => {
            const userData = {username: 'admin', name: 'Jest Test', password: 'mypasswordisthis'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(400)
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
        
        test('does not return password hashes', async () => {
            const response = await api.get('/api/users')
            expect(response.body[0].passwordHash).not.toBeDefined()
        })
    })
})

afterAll(() => {
    mongoose.connection.close()
})