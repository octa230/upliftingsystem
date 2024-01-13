const express = require('express')
const {getStockRecord,recordStock, getAllRecords} = require('../controllers/StockCtrl')

const stockRouter = express.Router()

stockRouter.post('/purchase', recordStock)
stockRouter.get('/q', getStockRecord)
stockRouter.get('/', getAllRecords)

module.exports =  stockRouter