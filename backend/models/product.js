const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    purchase: {type: Number},
    code: {type: String, required: true},
    price: {type: Number, required: true},
    inStock:{type: Number, required: true},
    prruchaseHistory: [{date:{type: Date, default: Date.now}, purchase:{type: Number}, total: {Number}}]
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product