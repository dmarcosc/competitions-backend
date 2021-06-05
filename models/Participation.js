const {model,Schema} = require('mongoose')
const participationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    contest: {
        type: Schema.Types.ObjectId,
        ref: 'Contest'
    },
    skills: {
        OMerit: [String],
        EMerit: [String],
        PMerit:  [String],
        KMerit: [String]
    },
    extra: {
        OMerit: [String],
        EMerit: [String],
        PMerit:  [String],
        KMerit: [String]
    },
    score: Number
})

participationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Participation = model('Participation', participationSchema)

module.exports = Participation