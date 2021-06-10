const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

//getUserInfo
usersRouter.get('/userInfo', (request, response, next) => {

    const authorization = request.get('authorization')
    let token = null
    if (authorization && authorization.toLocaleLowerCase().startsWith('bearer')) {
        token = authorization.substring(7)
    }
    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token , process.env.APP_SECRET)
    } catch (err) {
        console.log(err)
    }
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }

    User.findById(decodedToken.id).then(user => {
        if(user) {
            return response.json(user)
        } else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })

})
//Register
usersRouter.post('/', async (request ,response, next) => {
    const { body } = request
    const {email, password, name, secondName, birthDate, mobile, country} = body
    try {
    const encryptedPass = await bcrypt.hash(password, 10)
    const newUser = new User({
        email: email,
        password: encryptedPass,
        name,
        secondName,
        birthDate,
        mobile,
        country,
    })
    
    const savedUser = await newUser.save()

    const userForToken = {
        id: savedUser.id 
    }

    const token = jwt.sign(userForToken, process.env.APP_SECRET)
    response.status(201).send({
        id: savedUser.id,
        code: 'OK',
        message: 'Register succesful',
        token
    })
    } catch (err) {
        next(err)
    }
})

usersRouter.delete('/:id',(request, response, next) => {
    const { id } = request.params

    User.findByIdAndRemove(id)
        .then(() => { response.status(204).end()})
        .catch(error => next(error))
})
//Update User
usersRouter.put('/updateUser', async (request, response, next) => {
    const { body } = request
    const { name, secondName, birthDate, mobile, country} = body
    const authorization = request.get('authorization')
    let token = null
    if (authorization && authorization.toLocaleLowerCase().startsWith('bearer')) {
        token = authorization.substring(7)
    }
    let decodedToken = {}
    try {
        decodedToken = jwt.verify(token , process.env.APP_SECRET)
    } catch (err) {
        console.log(err)
    }
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }
    try  {
    const newUserInfo = {
        name,
        secondName,
        birthDate,
        mobile,
        country,
    }
    await User.findByIdAndUpdate(decodedToken.id, newUserInfo, { new: true })

    response.status(201).send({
        code: 'OK',
        message: 'User succesfully updated'
    })
    } catch (err) {
        next(err)
    }
})

module.exports = usersRouter