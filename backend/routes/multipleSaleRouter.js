const {getSales, getsingleSale, addSaleUnits, makeSale} = require('../controllers/multipleRetailCtrl');
const express = require('express');
const { isAuth } = require ('../utils/auth');




const multipleSaleRoutes = express.Router()

multipleSaleRoutes.post('/new-sale', makeSale)
multipleSaleRoutes.get('/list', getSales)
multipleSaleRoutes.get('/get-sale/:id', getsingleSale)
multipleSaleRoutes.post('/:id/add-units', addSaleUnits)

module.exports = {multipleSaleRoutes}