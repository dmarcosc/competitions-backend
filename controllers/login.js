const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

loginRouter.post('/', async(request, response) => {
    const {body} = request
    const {email, password} = body

    const user = await User.findOne({ email })
    const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.password)

    if(!(user && passwordCorrect)) {
        response.status(401).json({
            error: 'invalid user or password'
        })
    }
    const userForToken = {
        id: user.id 
    }

    const token = jwt.sign(userForToken, process.env.APP_SECRET)

    response.send({
        id: user.id,
        code: 'OK',
        message: 'Login succesful',
        token
    })
})

module.exports = loginRouter