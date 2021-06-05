const {model,Schema} = require('mongoose')
const userSchema = new Schema({
    email: String,
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
const User = model('User', userSchema)

module.exports = User