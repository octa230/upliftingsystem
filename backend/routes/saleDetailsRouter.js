const {getSales, getsingleSale, addSaleUnits, makeSale} = require('../controllers/saleDetails');
const express = require('express');
const { isAuth } = require ('../utils/auth');
const upload = require('../utils/upload')




const saleDetailsRouter = express.Router()

////IMAGE UPLOAD FUNCTION


saleDetailsRouter.post('/new-sale', makeSale)
saleDetailsRouter.get('/list', getSales)
saleDetailsRouter.get('/get-sale/:id', getsingleSale)
saleDetailsRouter.post('/:id/add-units', addSaleUnits)

module.exports = saleDetailsRouter