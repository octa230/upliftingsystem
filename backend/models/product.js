const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    purchase: {type: Number, default: 0},
    waste: {type: Number, default: 0},
    sold:{type: Number, default: 0},
    code: {type: String, required: true},
    price: {type: Number, required: true},
    inStock:{type: Number, required: true},
    openingStock: {type: Number, default: 0},
    closingStock: {type: Number, default: 0},
    purchasePrice: {type: Number, default: 0},
    purchaseHistory: [{date: {type: Date, default: Date.now}, purchase:{type: Number}}],
    wasteHistory: [{date: {type: Date, default: Date.now}, quantity : {type: Number}}]
}, 
{
    timestamps: true
})


const transactionSchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'product', ref: 'Product'},
    productName: {type: String},
    purchasePrice: {type: Number, default: 0},
    sellingPrice: {type: Number, default: 0},
    type: {type: String, Enumerator: ['purchase', 'sale', 'damage', 'display'], required: true},
    quantity: {type: Number, required: true},
},
{
    timestamps: true
})

const Transaction = mongoose.model("Transaction", transactionSchema)
const Product = mongoose.model('Product', productSchema);

module.exports = {Transaction, Product}