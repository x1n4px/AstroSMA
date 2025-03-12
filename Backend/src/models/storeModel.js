const mongoose = require('mongoose');

const StoreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    creation_date: {
        type: Date
    },
    employee: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }]

}, { collection: 'stores' });

StoreSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
})

module.exports = mongoose.model('Store', StoreSchema);