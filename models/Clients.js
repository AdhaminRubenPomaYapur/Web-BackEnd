const mongoose = require('mongoose')

const ClientSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    dni: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    telephone: {
        type: String,
        trim: true
    },
    current_balance: {
        type: Number,
        trim: true,
        default: 0.0
    },
    typeClient: {
        type: String,
        required: true,
        default: 'CATEGORY_A'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    }
})

module.exports = mongoose.model('Clients', ClientSchema)