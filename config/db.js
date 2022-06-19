const mongoose = require('mongoose')
require('dotenv').config({path:'variables.env'})
const connectedDB = async () => {
    try {
        mongoose.connect(process.env.DB_MONGO, {

        }, () => {
            console.log(`The data base connected successful`)
        })
    } catch (e) {
        console.log(`Error: ${e}`)
    }
}

module.exports = connectedDB