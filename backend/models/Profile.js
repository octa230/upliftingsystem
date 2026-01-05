import mongoose from "mongoose";


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



export const Employee = mongoose.model('Employee', EmployeeSchema)

