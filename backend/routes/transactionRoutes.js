const express = require('express')
const {
    queryRecords, 
    visualizeTransactions,
    dailyReport
} = require('../controllers/transactionsCtrl')



const transactionsRouter = express.Router()



transactionsRouter.get('/records', queryRecords)
transactionsRouter.get('/daily-report', dailyReport)
transactionsRouter.get('/visualize', visualizeTransactions)



module.exports = transactionsRouter