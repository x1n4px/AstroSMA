const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    contract_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract'
    },
    rol: {
        type: String
    },
    entry_date: {
        type: Date
    },
    name: {
        type: String
    },
    surname: {
        type: String
    }

}, { collection: 'employees' });

EmpleadoSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = mongoose.model('Employee', EmployeeSchema);