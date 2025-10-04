import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {type: String, required: true},
    controlId: {type: String, trim: true, required: true, unique: true},
    logo: {type: String, required: true},
    poBox:{type: String},
    footerLogo: {type: String},
    description: {type: String},
    mobile: {type: String},
    phone: {type: String},
    address: {type: String},
    email: {type: String},
    trn: {type: String},
    website: {type: String},
    printFormat: {type: String}
})

const Company = mongoose.model('Company', companySchema)
export default Company