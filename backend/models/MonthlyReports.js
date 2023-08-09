const mongoose = require('mongoose')

const MonthlyDamagesSchema = new mongoose.Schema({
    product: {type: mongoose.Types.ObjectId, ref: 'Product'},
    year: {type: Number, required: true},
    month: {type: Number, required: true},
    damagedCount: {type: Number, required: true},
    displayCount: {type: Number, required: true},
    createdAt: {type: Date, default: Date.now}
})

const MonthlyDamages = mongoose.model('MonthlyReport', MonthlyDamagesSchema)
module.exports = MonthlyDamages