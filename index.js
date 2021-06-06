const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('./mongo') // Db connection
const app = express()
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const contestsRouter = require('./controllers/contests')
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/contests', contestsRouter)

//middlewares to handle errors
app.use((request, response) => {
    response.status(404).end()
})

app.use((error, request, response) => {
    console.error(error)
    if(error.name === 'CastError') {
        response.status(400).end()
    } else {
        response.status(500).end()
    }
})

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})

module.exports = {app, server}