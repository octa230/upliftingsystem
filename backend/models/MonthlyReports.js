const mongoose = require('mongoose')



const MonthlyReportSchema = new mongoose.Schema({
    month: {type: String, required: true},
    year: {type: String, required: true},
    purchases: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
    sales: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
    damages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
    display: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
})



const MonthlyStock = mongoose.model('MonthlyStockReport', MonthlyReportSchema)
module.exports = MonthlyStock