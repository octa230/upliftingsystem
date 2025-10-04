import mongoose from "mongoose";



const productSchema = new mongoose.Schema({
    name: {type: String, uppercase: true,},
    identifier: {type: String, Enumerator:['STEM', 'PLANT', 'BUNCH', 'TOOL', 'ACCESSORY', 'ARRANGEMENT']},
    purchase: {type: Number, default: 0},
    photo: {type: String},
    waste: {type: Number, default: 0},
    sold:{type: Number, default: 0},
    code: {type: String, uppercase: true},
    price: {type: Number, required: true},
    inStock:{type: Number, default: 0},
    openingStock: {type: Number, default: 0},
    closingStock: {type: Number, default: 0},
    purchasePrice: {type: Number, default: 0},
    returned: {type: Number, default: 0}
}, 
{
    timestamps: true
})


const transactionSchema = new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    productName: {type: String},
    purchasePrice: {type: Number, default: 0},
    sellingPrice: {type: Number, default: 0},
    type: {type: String, enum: ['purchase', 'sale', 'damage', 'returned', 'hotel'], required: true},
    identifier: {type: String, Enumerator:['STEM', 'PLANT', 'BUNCH', 'TOOL', 'ACCESSORY', 'ARRANGEMENT']},
    quantity: {type: Number, required: true},
    deliveryNote: String
},
{
    timestamps: true
})

productSchema.pre('save', function(next) {
  // `this` refers to the document being saved
  if (!this.code) {
    this.code = Math.random().toString(36).slice(2, 10).toUpperCase(); // Random 10-character code
  }

  if (!this.name) {
    this.name = `Product-${Math.random().toString(36).slice(2, 5).toUpperCase()}`; // Random name
  }

  next(); // Proceed with save
});

export const Transaction = mongoose.model("Transaction", transactionSchema)
export const Product = mongoose.model('Product', productSchema);

