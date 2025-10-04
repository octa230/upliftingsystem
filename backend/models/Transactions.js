import mongoose from "mongoose"

const DamageSchema = new mongoose.Schema({
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


const PurchaseSchema = new mongoose.Schema({
    deliveryNote: {type: String},
    dateRecorded: {type: String},
    supplier: {type: String},
    Items: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
        productName: {type: String},
        quantity: {type: Number, required: true, default: 0},
        purchasePrice: {type: Number, default: 0},
        identifier: {type: String}
    }],
    total: {type: Number, default: 0}
},
{
    timestamps: true
}
)



const unitSchema = new mongoose.Schema({
    arrangement: {type: String, required: false},
    photo: {type: String},
    products: [{
        product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
        quantity: {type: Number, required: true},
        productName: {type: String},
        identifier: {type: String}
    }],
},
{
    timestamps: true
}
)

const SaleSchema = new mongoose.Schema({
    InvoiceCode: {type: String, required: true},
    status:{type: String, Enumerator:['completed', 'pending', 'cancelled'], default: "completed"},
    saleItems:[{
        productName: {type: String, required: true},
        price: {type: Number, required: true},
        quantity: {type: Number, required: true},
        total: {type: Number},
        arrangement: {type: String, required: true},
        identifier: {type: String},
        photo: {type: String}
    }],
    total:{type: Number, required: true, default: 0, min: 0},
    itemsTotal:{type: Number, required: true, default: 0, min: 0 },
    subTotal:{type: Number, required: true},
    date:{type: String, required: true},
    name:{type: String, required: true},
    paidBy: {type: String, required: true},
    phone: {type: String, required: true},
    preparedBy: {type: String, requred: true},
    service: {type: String, required: true},
    free:{type: Boolean, default: false},
    vat:{type: Number},
    discount: {type: Number},
    orderedBy: {type: String},
    deliveredTo: {type: String},
    recievedBy: {type: String},
    driver: {type: String},
    units:[unitSchema],
},
{
    timestamps: true
}
)


export const Damages = mongoose.model('Damage', DamageSchema)
export const Purchase = mongoose.model('Purchase', PurchaseSchema)
export const Sale = mongoose.model('Sale', SaleSchema)












