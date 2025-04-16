import mongoose from "mongoose";


const CompanySchema = new mongoose.Schema({
    name: String,
    code: String,
    Logo: String,
    TRN: String,
    Address: String,
    Fax: Number,
    Email: String,
    country: String,
    Phone: String,
    VatNo: String,
    PoBox: String,
    website: String,
    BankAcc:{
        Name: String,
        AccNo: String,
        Beneficiary: String,
        IbanNo: String
    }
})



const CustomerSchema = new mongoose.Schema({
    Name: String,
    Phone: String,
})


const EmployeeSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, sparse: true},
    Nationality: String,
    Position: String,
    Phone: String,
    Schedule: {type: String, Enumerator:['PartTime', "FullTime"]},
    email:{type: String, required: true},
    isAdmin:{type: Boolean, default: false},
    password: {type: String},
})


export const Company = mongoose.model('Company', CompanySchema)
export const Customer = mongoose.model('Customer', CustomerSchema)
export const Employee = mongoose.model('Employee', EmployeeSchema)

