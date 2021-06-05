const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', (request, response) => {
    User.find({}).then(users => {
        response.json(users)
    })
})

usersRouter.get('/:id', (request, response, next) => {
    const id = request.params.id

    User.findById(id).then(user => {
        if(user) {
            return response.json(user)
        } else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })

})

usersRouter.post('', async (request,response, next) => {
    const { body } = request
    const {email, password, name, secondName, birthDate, mobile, country} = body

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
    newUser.save().then(savedUser => {
        response.status(201).json(savedUser)
    }).catch(err => next(err))
})

usersRouter.delete('/:id',(request, response, next) => {
    const { id } = request.params

    User.findByIdAndRemove(id)
        .then(() => { response.status(204).end()})
        .catch(error => next(error))
})

usersRouter.put('/:id',(request, response, next) => {
    const { id } = request.params
    const { body } = request
    const {email, password, name, secondName, birthDate, mobile, country} = body

    const newUserInfo = new User({
        email,
        password: password,
        name,
        secondName,
        birthDate,
        mobile,
        country,
    })
    User.findByIdAndUpdate(id, newUserInfo, { new: true })
    .then(result => {
        response.json(result)
    }).catch(error => next(error))
})

module.exports = usersRouter