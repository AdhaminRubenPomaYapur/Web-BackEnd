const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    lastname: {
        type: String,
        require: true,
        trim: true
    },
    dni: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true,
        trim: true,
    },
    create: {
        type: Date,
        default: Date.now()
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Banks'
    }
})

module.exports = mongoose.model('Users', UserSchema)