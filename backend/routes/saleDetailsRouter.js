const {getSales, getsingleSale, addSaleUnits, aggregateDataIndependently,
    makeSale, salesData, getSalesData, aggregateInvoicesDataForPhone
} = require('../controllers/saleDetails');

const express = require('express');




const saleDetailsRouter = express.Router()

////IMAGE UPLOAD FUNCTION


saleDetailsRouter.post('/new-sale', makeSale)
saleDetailsRouter.get('/list', getSales)
saleDetailsRouter.get('/get-sale/:id', getsingleSale)
saleDetailsRouter.post('/:id/add-units', addSaleUnits)
saleDetailsRouter.get('/sales-data', salesData)
saleDetailsRouter.get('/sales-data', getSalesData)
saleDetailsRouter.get('/aggregated-sale-data', aggregateDataIndependently)


module.exports = saleDetailsRouter