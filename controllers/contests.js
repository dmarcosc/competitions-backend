const contestsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Contest = require('../models/Contest')
const Participation = require('../models/Participation')


contestsRouter.get('/', async (request, response) => {
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
    const contests = await Contest.find({})
    response.json(contests)
})

contestsRouter.get('/:id', (request, response, next) => {
    const id = request.params.id
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

    Contest.findById(id).then(contest => {
        if(contest) {
            return response.json(contest)
        } else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })

})

contestsRouter.get('/createdBy/:id', (request, response, next) => {
    const id = request.params.id
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

    Contest.find({ creator :id }).then(contest => {
        if(contest) {
            return response.json(contest)
        } else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })
})
// create contest process
contestsRouter.post('', async (request,response, next) => {
    const { body } = request
    const {name, field, dueDate, employer, vacancies, description, requirements, skills, extra, participations} = body
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
    const newContest = new Contest({
        creator: decodedToken.id,
        name,
        field,
        dueDate,
        employer,
        vacancies,
        description,
        requirements,
        skills,
        extra,
        participations
    })
    newContest.save().then(savedContest => {
        response.status(201).json(savedContest)
    }).catch(err => next(err))
})
// adds a participation to de contest, apply process
contestsRouter.put('/:id', async (request, response, next) => {
    const { id } = request.params
    const { body } = request
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

    const newParticipation = new Participation ({
        user: body.user,
        contest: id,
        requirements: body.requirements,
        skills: body.skills,
        extra: body.extra
    })

    try {
    const score = await calculateScore(id, request.body)
    console.log(score)
    newParticipation.score = score
    const savedParticipation = await newParticipation.save()
    const contest = await Contest.findById(id)
    contest.participations = contest.participations.concat(savedParticipation._id)
    await contest.save()

    response.status(200).json(savedParticipation)

    } catch (err){
        next(err)
    } 
})
// shows all contests the given user participated in
contestsRouter.get('/participations/:id', (request, response, next) => {
    const id = request.params.id
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

    Participation.find({ user :id }).populate('contest',{
        name: 1,
        dueDate: 1,
        field: 1
    } ).then(participation => {
        if(participation) {
        return response.json(participation)
        }
        else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })

})
// contest detail
contestsRouter.get('/detail/:id', async (request, response, next) => {
    const id = request.params.id
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
    try {
        const contests = await Contest.findById(id).populate({
            path: 'participations',
            populate:{
                path: 'user',
                select: ['name','secondName']
            },
            select: 'score'
        })
        return response.json(contests)   
    } catch(err){
        next(err)
    }
})

const calculateScore = async (id, participation) => {
    
    const contest = await Contest.findById(id)
    let score = 10
    const diff = ((contest.skills.OMerit.length + contest.skills.EMerit.length + contest.skills.PMerit.length + contest.skills.KMerit.length) 
    - (participation.skills.OMerit.length + participation.skills.EMerit.length + participation.skills.PMerit.length + participation.skills.KMerit.length))
    score = score - diff
    const extraO = participation.extra.OMerit[0] ? (contest.extra.OMerit * .01) * participation.extra.OMerit.length : 0
    const extraE = participation.extra.EMerit[0] ? (contest.extra.EMerit * .01) * participation.extra.EMerit.length : 0
    const extraP = participation.extra.PMerit[0] ? (contest.extra.PMerit * .01) * participation.extra.PMerit.length : 0
    const extraK = participation.extra.KMerit[0] ? (contest.extra.KMerit * .01) * participation.extra.KMerit.length : 0
    score = score +  extraO + extraE +extraP + extraK

    if (score < 4) score = 4
    if (score > 10) score = 10
    return (score * 10)
}

module.exports = contestsRouter