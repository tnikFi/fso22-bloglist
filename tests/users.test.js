const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./users_test_helper')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await helper.setInitialState()
})

describe('when the users database is empty', () => {
    describe('creating a user', () => {
        test('returns the new user object', async () => {
            const userData = {username: 'user123', name: 'Account Owner', password: 'password!'}
            const response = await api.post('/api/users').send(userData)
            expect(response.status).toBe(201)
            expect(response.body.id).toBeDefined()
        })

        test('will not return sensitive info', async () => {
            const userData = {username: 'user123', name: 'Account Owner', password: 'password!'}
            const response = await api.post('/api/users').send(userData)
            expect(response.body.passwordHash).not.toBeDefined()
            expect(response.body.password).not.toBeDefined()
        })

        test('adds the user to the database', async () => {
            const userData = {username: 'user123', name: 'Account Owner', password: 'password!'}
            await api.post('/api/users').send(userData)
            const users = await helper.getUsers()
            expect(users.length).toBe(helper.initialData.length + 1)
        })
    })

    describe('getting user info', () => {
        test('will not return sensitive info', async () => {
            const userData = {username: 'user123', name: 'Account Owner', password: 'password!'}
            await api.post('/api/users').send(userData)
            const testUser = await helper.getUsers()[0]
            expect(testUser.passwordHash).not.toBeDefined()
        })
    })
})