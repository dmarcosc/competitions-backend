const bcrypt = require('bcrypt')
const User = require('../models/User')
const { api, getUsers } = require('./helpers')
const moongose = require('mongoose')
const { server } = require('../index')

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('pswd', 10)
    const user = new User({ mail: 'dani', passwordHash })

    await user.save()
  })

  test('works as expected creating a fresh mail', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      mail: 'miduroot@prueba.com',
      name: 'Miguel',
      password: 'tw1tch'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getUsers()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usermails = usersAtEnd.map(u => u.mail)
    expect(usermails).toContain(newUser.mail)
  })

  test('creation fails with proper statuscode and message if mail is already taken', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      mail: 'miduroot@prueba.com',
      name: 'Miguel',
      password: 'midutest'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    console.log(result.body)

    expect(result.body.error).toContain('expected `mail` to be unique')

    const usersAtEnd = await getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  afterAll(() => {
    moongose.connection.close()
    server.close()
  })
})