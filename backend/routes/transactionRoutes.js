const express = require('express')
const {
    queryRecords, 
    monthlySummary, 
    visualizeTransactions
} = require('../controllers/transactionsCtrl')



const transactionsRouter = express.Router()



transactionsRouter.get('/records', queryRecords)
transactionsRouter.get('/visualize', visualizeTransactions)
transactionsRouter.get('/monthly-summary', monthlySummary)



module.exports = transactionsRouter