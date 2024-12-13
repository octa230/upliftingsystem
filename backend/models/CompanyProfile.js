import mongoose from "mongoose";


const company = new mongoose.Schema({
    Name: String,
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