import mongoose from 'mongoose'

/**
 * expense Primary account(s)
 * ie Gas, Food, utilities 
 */
const Expense_Acc_Schema = new mongoose.Schema({
    name:{type: String, lowercase: true, unique: true},
    type:{type: String},
    total:{type: Number, min: 0, default: 0},
    transactions:[{type: mongoose.Types.ObjectId}]
},{timestamps: true}
)

/**
 * expense Specific Transaction schema
 * 
 */
const Expense_Schema = new mongoose.Schema({
    account: {type: mongoose.Types.ObjectId, ref:'Expense_Acc'},
    employee: {type: mongoose.Types.ObjectId, ref:'Employee'},
    submittedOn:{type: Date},
    billFile: {type: String},
    notes: {type: String},
    status: {
        type: String, 
        Enumerator:['approved', 'declined', 'cancelled'], default: "approved"
    },
    amount: {type: Number}
}, {timestamps: true}
)


mongoose.Number.get(function(v) {return Math.floor(v)})
export const Expense_Acc = mongoose.model('Expense_Acc', Expense_Acc_Schema)
export const Expense = mongoose.model('Expense', Expense_Schema)
