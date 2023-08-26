const mongoose = require('mongoose')

const stockHistory = new mongoose.Schema({
    quantity: {type: Number, required: true},
    timestamps: {type: Date, default: Date.now}
})
const stockSchema = new mongoose.Schema({
    product:{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    newStock: {type: Number},
    totalStock: {type: Number},
    history:[stockHistory]
})

const Stock = mongoose.Model('Stock', stockSchema)
module.exports = Stock