const { getSales, getsingleSale, addSaleUnits,
    makeSale, getSalesData, customerData, querySalesData,
    todaySales,
    searchSale,
    updateSale,
} = require('../controllers/saleDetails');

const express = require('express');




const saleDetailsRouter = express.Router()

////IMAGE UPLOAD FUNCTION

saleDetailsRouter.get('/customer-data', customerData)
saleDetailsRouter.get('/search', searchSale)
saleDetailsRouter.put('/edit/:id', updateSale)
saleDetailsRouter.post('/new-sale', makeSale)
saleDetailsRouter.get('/list', getSales)
saleDetailsRouter.get('/today-sales', todaySales)
saleDetailsRouter.get('/get-sale/:id', getsingleSale)
saleDetailsRouter.post('/:id/add-units', addSaleUnits)
saleDetailsRouter.get('/sales-data', getSalesData)
saleDetailsRouter.get('/for', querySalesData)


module.exports = saleDetailsRouter