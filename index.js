const {ApolloServer} = require('apollo-server')
const typeDefs = require('./db/schemas')
const resolvers = require('./db/resolvers')
const jwt = require('jsonwebtoken')

require('dotenv').config({path:'variables.env'})

const connectedDB = require('./config/db')
connectedDB()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {

        const token = req.headers['authorization'] || ''
        if(token){
            try {
                const Authorization = jwt.verify(token.replace('Bearer ',''), process.env.SECRET)
                return {Authorization}
            } catch (e) {
                console.log(`Error: ${e}`)
            }
        }
    }
})

server.listen().then(({url}) => {
    console.log(`The service up: ${url}`)
})
