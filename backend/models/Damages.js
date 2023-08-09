const mongoose = require('mongoose')


const DamagedSchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}, 
    isDamaged: {type: Boolean, default: false},
    isDisplay: {type: Boolean, default: false},
    quantity: {type: Number, requred: true},
    totalPrice: {type: Number, required: true},
    photos:[{data: Buffer, type: String}],
    createdAt: {type: Date, default: Date.now}
})

const Damaged = mongoose.model('Damaged', DamagedSchema)
module.exports = Damaged