const mongoose = require('mongoose')

const BranchOfficesSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    address: {
        type: String,
        require: true
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true
    }
})

module.exports = mongoose.model('BranchOffices', BranchOfficesSchema)