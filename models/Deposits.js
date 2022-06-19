const mongoose = require('mongoose')

const DepositSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'Users'
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'Clients'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true,
        ref: 'BranchOffices'
    },
    dateDeposit: {
        type: Date,
        default: Date.now()
    },
    depositTerm: {
        type: String,
        default: 'SIX_MONTHS'
    },
    coin: {
        type: String,
        default: 'BOL'
    },
    amount: {
        type: Number,
        require: true,
        trim: true
    }

})

module.exports = mongoose.model('Deposits', DepositSchema)