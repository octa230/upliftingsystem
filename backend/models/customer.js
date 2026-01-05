import { model, Schema } from "mongoose";

const customerSchema = new Schema({
    name: {type: String, lowercase: true, required: true},
    logo: String,
    poBox: String,
    taxRegNumber: String,
    address: String,
    phone: String,
    email: String,
    paidAmount: {type: Number, min: 0},
    pendingBalance: {type: Number, min: 0}
})

const Customer = model('Customer', customerSchema)
export default Customer