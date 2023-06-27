const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    InvoiceCode: {type: String, required: true},
    saleItems:[{
        product:{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name:{type: String, required: true},
        quantity: {type: Number, required: true},
        price: {type: Number, required: true},
    }],
    totalPrice: {type: Number, required: true},
    preparedBy: {type: String, required: true},
    paidBy: {type: String, required: true},
    service: {type: String, required: true},
    date: {type: String, required: true},
    taxPrice: {type: Number, required: true},
    saleItemsPrice: {type: Number, required: true},
    phone: {type: String, required: true},
    customer: {type: String, required: true},
 
},
{
    timestamps: true
}
)

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;