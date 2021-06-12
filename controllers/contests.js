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

contestsRouter.get('/createdBy', async (request, response, next) => {
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
    const createdContests = await Contest.find({ creator: decodedToken.id },
        {
            id: 1,
            name: 1,
            field: 1,
            dueDate:1
        })
    if(createdContests) {
        return response.status(200).json(createdContests)
    } else {
            response.status(404).end()
    }
    } catch (err) {
        next(err)
    }
    
    
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

    try {
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
    const savedContest = await newContest.save()
    response.status(201).send({
        id: savedContest.id,
        code: 'OK',
        message: 'Contest creation succesful'
    })
    } catch (err) {
        next(err)
    }
})
// adds a participation to de contest, apply process
contestsRouter.put('', async (request, response, next) => {
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
        user: decodedToken.id,
        contest: body.contest,
        requirements: body.requirements,
        skills: body.skills,
        extra: body.extra
    })

    try {
    const score = await calculateScore(request.body)
    newParticipation.score = score
    const savedParticipation = await newParticipation.save()
    const contest = await Contest.findById(body.contest)
    contest.participations = contest.participations.concat(savedParticipation._id)
    await contest.save()

    response.status(201).send({
        score: savedParticipation.score,
        code: 'OK',
        message: 'Participation process succesful'
    })

    } catch (err){
        next(err)
    } 
})
// shows all contests the given user participated in
contestsRouter.get('/participations', async (request, response, next) => {
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
    const contestApplied = await Participation.find({ user :decodedToken.id },{
        contest: 1
    }).populate('contest',{
        name: 1,
        dueDate: 1,
        field: 1
    })

    if(contestApplied) {
        // response.status(201).send({
        //     id: contestApplied.contest.id,
        //     name: contestApplied.contest.name,
        //     field: contestApplied.contest.field,
        //     dueDate: contestApplied.contest.dueDate,
        //     code: 'OK',
        //     message: 'Contests list applied not empty'
        // })
        return response.status(200).json(contestApplied)
    } else {
            response.status(404).end()
    }
    } catch (err) {
        next(err)
    }

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
        const contests = await Contest.findById(id,{participations: 1, vacancies: 1}).populate({
            path: 'participations',
            populate:{
                path: 'user',
                select: ['name','secondName']
            },
            select: 'score'
        })
        return response.status(200).json(contests)
    } catch(err){
        next(err)
    }
})
contestsRouter.get('/:id', async (request, response, next) => {
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
const calculateScore = async (participation) => {
    
    const contest = await Contest.findById(participation.contest)
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