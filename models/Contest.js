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
        OMerit: [{
            title: String,
            description: String
        }],
        EMerit: [{
            title: String,
            description: String
        }],
        PMerit:  [{
            title: String,
            description: String
        }],
        KMerit: [{
            title: String,
            description: String
        }],
    },
    skills: {
        OMerit: [{
            title: String,
            description: String
        }],
        EMerit: [{
            title: String,
            description: String
        }],
        PMerit:  [{
            title: String,
            description: String
        }],
        KMerit: [{
            title: String,
            description: String
        }],
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