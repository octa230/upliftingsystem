const mongoose = require('mongoose')


const DamagedSchema = new mongoose.Schema({
    date:{type: String}, 
    Items: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        productName: {type: String},
        quantity: {type: Number, default: 0},
        purchasePrice: {type: Number, default: 0}
    }],
    total: {type: Number, default: 0}
},
{
    timestamps: true
})

const Damaged = mongoose.model('Damaged', DamagedSchema)
module.exports = Damaged