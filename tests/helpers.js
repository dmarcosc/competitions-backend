const { app } = require('../index')
const supertest = require('supertest')
const User = require('../models/User')

const api = supertest(app)

const initialContest = [
  {
    content: 'Aprendiendo FullStack JS con midudev',
    important: true,
    date: new Date()
  },
  {
    content: 'Sígueme en https://midu.tube',
    important: true,
    date: new Date()
  },
  {
    content: 'Gracias al chat por vuestra ayuda! :D',
    important: true,
    date: new Date()
  }
]

const getAllContentFromContest = async () => {
  const response = await api.get('/api/contests')
  return {
    contents: response.body.map(note => note.content),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

module.exports = {
  api,
  initialContest,
  getAllContentFromContest,
  getUsers
}