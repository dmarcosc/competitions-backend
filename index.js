const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
})

app.post('/api/users', (request,response) => {
    const user = request.body

    response.status(201).json(user)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`)
})