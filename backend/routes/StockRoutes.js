const express = require('express')
const recordStock = require('../controllers/StockCtrl')

const stockRouter = express.Router()

stockRouter.post('/purchase', recordStock)


module.exports =  stockRouter