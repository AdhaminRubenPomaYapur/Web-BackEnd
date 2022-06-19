const mongoose = require('mongoose')

const AccountBankSchema = mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Clients'
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Banks'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BranchOffices'
    },
    numberAccount: {
        type: String,
        required: true,
        trim: true
    },
    accountBalance: {
        type: Number,
        required: true,
        trim: true
    },
    typeAccount: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('AccountsBank', AccountBankSchema)