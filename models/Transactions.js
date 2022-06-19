const mongoose = require('mongoose')

const TransactionSchema = mongoose.Schema({
    accountOrigin: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'AccountsBank'
    },
    accountDestination: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'AccountsBank'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'Users'
    },
    amount: {
        type: Number,
        require: true
    }
})

module.exports = mongoose.model('Transactions', TransactionSchema)