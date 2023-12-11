const express = require('express')
const monthlyTransactionSummary = require('../controllers/transactionsCtrl')



const transactionsRouter = express.Router()

transactionsRouter.get('/monthly-summary', monthlyTransactionSummary)



module.exports = transactionsRouter