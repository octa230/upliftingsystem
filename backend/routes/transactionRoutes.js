const express = require('express')
const {
    queryRecords, 
    visualizeTransactions
} = require('../controllers/transactionsCtrl')



const transactionsRouter = express.Router()



transactionsRouter.get('/records', queryRecords)
transactionsRouter.get('/visualize', visualizeTransactions)



module.exports = transactionsRouter