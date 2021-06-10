const moongose = require('mongoose')

const { server } = require('../index')
const Contest = require('../models/Contest')
const {
  api,
  initialContest,
  getAllContentFromContest
} = require('./helpers')

beforeEach(async () => {
  await Contest.deleteMany({})

  // sequential
  for (const contest of initialContest) {
    const contestObject = new Contest(contest)
    await contestObject.save()
  }
})

describe('GET all contests', () => {
  test('contests are returned as json', async () => {
    await api
      .get('/api/contests')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two contests', async () => {
    const response = await api.get('/api/contests')
    expect(response.body).toHaveLength(initialContest.length)
  })

  test('the first note is about midudev', async () => {
    const {
      contents
    } = await getAllContentFromContest()

    expect(contents).toContain('Aprendiendo FullStack JS con midudev')
  })
})

describe('create a contest', () => {
  test('is possible with a valid contest', async () => {
    const newContest = {
      content: 'Proximamente async/await',
      important: true
    }

    await api
      .post('/api/contests')
      .send(newContest)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllContentFromContest()

    expect(response.body).toHaveLength(initialContest.length + 1)
    expect(contents).toContain(newContest.content)
  })

  test('is not possible with an invalid contest', async () => {
    const newContest = {
      important: true
    }

    await api
      .post('/api/contests')
      .send(newContest)
      .expect(400)

    const response = await api.get('/api/contests')

    expect(response.body).toHaveLength(initialContest.length)
  })
})

test('a note can be deleted', async () => {
  const { response: firstResponse } = await getAllContentFromContest()
  const { body: contests } = firstResponse
  const contestToDelete = contests[0]

  await api
    .delete(`/api/contests/${contestToDelete.id}`)
    .expect(204)

  const { contents, response: secondResponse } = await getAllContentFromContest()

  expect(secondResponse.body).toHaveLength(initialContest.length - 1)

  expect(contents).not.toContain(contestToDelete.content)
})

test('a contest that has an invalid id can not be deleted', async () => {
  await api
    .delete('/api/notes/1234')
    .expect(400)

  const { response } = await getAllContentFromContest()

  expect(response.body).toHaveLength(initialContest.length)
})

test('a contest that has a valid id but do not exist can not be deleted', async () => {
  const validObjectIdThatDoNotExist = '60451827152dc22ad768f442'
  await api
    .delete(`/api/notes/${validObjectIdThatDoNotExist}`)
    .expect(404)

  const { response } = await getAllContentFromContest()

  expect(response.body).toHaveLength(initialContest.length)
})

afterAll(() => {
  moongose.connection.close()
  server.close()
})