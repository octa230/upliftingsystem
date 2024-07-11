const mongoose = require('mongoose')

const PurchaseSchema = new mongoose.Schema({
    deliveryNote: {type: String},
    dateRecorded: {type: String},
    Items: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
        productName: {type: String},
        quantity: {type: Number, required: true, default: 0},
        purchasePrice: {type: Number, default: 0}
    }],
    total: {type: Number, default: 0}
},
{
    timestamps: true
}
)
const Purchase = mongoose.model('Purchase', PurchaseSchema)

module.exports = Purchase
