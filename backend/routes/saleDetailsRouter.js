const {getSales, getsingleSale, addSaleUnits, aggregateDataIndependently,
    makeSale, salesData, getSalesData, aggregateInvoicesDataForPhone, customerData
} = require('../controllers/saleDetails');

const express = require('express');




const saleDetailsRouter = express.Router()

////IMAGE UPLOAD FUNCTION

saleDetailsRouter.get('/customer-data', customerData)
saleDetailsRouter.post('/new-sale', makeSale)
saleDetailsRouter.get('/list', getSales)
saleDetailsRouter.get('/get-sale/:id', getsingleSale)
saleDetailsRouter.post('/:id/add-units', addSaleUnits)
saleDetailsRouter.get('/sales-data', salesData)
saleDetailsRouter.get('/sales-data', getSalesData)
saleDetailsRouter.get('/aggregated-sale-data', aggregateDataIndependently)


module.exports = saleDetailsRouter