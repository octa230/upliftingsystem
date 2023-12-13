const express = require('express')
const {queryRecords, monthlySummary} = require('../controllers/transactionsCtrl')



const transactionsRouter = express.Router()



transactionsRouter.get('/records', queryRecords)
transactionsRouter.get('/monthly-summary', monthlySummary)



module.exports = transactionsRouter