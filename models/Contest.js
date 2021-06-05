const {model,Schema} = require('mongoose')
const contestSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    field: String,
    dueDate: Date,
    employer: String,
    vacancies: Number,
    description: String,
    requirements: {
        OMerit: [String],
        EMerit: [String],
        PMerit:  [String],
        KMerit: [String]
    },
    skills: {
        OMerit: [String],
        EMerit: [String],
        PMerit:  [String],
        KMerit: [String]
    },
    extra: {
        OMerit: Number,
        EMerit: Number,
        PMerit:  Number,
        KMerit: Number
    },
    participations: [
        {
                type: Schema.Types.ObjectId,
                ref: 'Participation'
        }
    ]
})

contestSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Contest = model('Contest', contestSchema)

module.exports = Contest