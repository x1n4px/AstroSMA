const mongoose = require('mongoose');

const ContractSchema = mongoose.Schema({
    contract_type: {
        type: String
    },
    weekly_hours: {
        type: int
    },
    anual_hours: {
        type: int
    }

}, { collection: 'employees' });

ContractSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = mongoose.model('Employee', ContractSchema);