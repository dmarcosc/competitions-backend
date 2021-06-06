const {model, Schema} = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    name: String,
    secondName: String,
    birthDate: String,
    mobile: String,
    country: String
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

userSchema.plugin(uniqueValidator)
const User = model('User', userSchema)

module.exports = User