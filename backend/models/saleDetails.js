const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    arrangement: {type: String, required: false},
    products: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number, required: true}
    }],
},
{
    timestamps: true
}
)

const SaleDetailSchema = new mongoose.Schema({
    InvoiceCode: {type: String, required: true},
    saleItems:[{
        productName: {type: String, required: true},
        price: {type: Number, required: true},
        quantity: {type: Number, required: true},
        arrangement: {type: String, required: true},
        photo:[{type: String}],
    }],
    total:{type: Number, required: true},
    subTotal:{type: Number, required: true},
    date:{type: String, required: true},
    name:{type: String, required: true},
    paidBy: {type: String, required: true},
    phone: {type: String, required: true},
    preparedBy: {type: String, requred: true},
    service: {type: String, required: true},
    units:[unitSchema],
},
{
    timestamps: true
}
)

const SaleDetails = mongoose.model('SaleDetails', SaleDetailSchema)
module.exports = SaleDetails