const mongoose = require('mongoose')

const BankSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    }
})

module.exports = mongoose.model('Banks', BankSchema)