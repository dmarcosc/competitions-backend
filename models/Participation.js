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
    requirements: {
        OMerit: [
            {
                date: Date,
                grade: Number,
                file: String
            }
        ],
        EMerit: [
            {
                description: String,
                time: Number, // meses
                company: String
            }
        ],
        PMerit: [
            {
            description: String,
            file: String
            }
        ],
        KMerit: [
            {
            date: Date,
            grade: Number,
            file: String
            }
        ]
    },
    skills: {
        OMerit: [
            {
                date: Date,
                grade: Number,
                file: String
            }
        ],
        EMerit: [
            {
                description: String,
                time: Number, // meses
                company: String
            }
        ],
        PMerit: [
            {
            description: String,
            file: String
            }
        ],
        KMerit: [
            {
            date: Date,
            grade: Number,
            file: String
            }
        ]
    },
    extra: {
        OMerit: [
            {
                title: String,
                date: Date,
                grade: Number,
                file: String
            }
        ],
        EMerit: [
            {
                description: String,
                time: Number, // meses
                company: String
            }
        ],
        PMerit: [
            {
            description: String,
            file: String
            }
        ],
        KMerit: [
            {
            title: String,
            date: Date,
            grade: Number,
            file: String
            }
        ]
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