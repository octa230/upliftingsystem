const mongoose = require('mongoose')

const AnnualDamagesSchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, Ref: 'Product'},
    year: {type: Number, required: true},
    totalDamagedCount: {type: Number, required: true},
    totalDisplayCount: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now}
})

const AnnualDamages = mongoose.model('AnnualDamages', AnnualDamagesSchema)
module.exports = AnnualDamages