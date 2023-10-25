const express = require('express');
const {getSales, 
    makeSale, 
    getSingleSale, 
    salesSummary, 
    deleteSale,
    getCodes
} = require('../controllers/saleCtrl')



const salesRouter = express.Router();

salesRouter.get('/get-sale/:id', getSingleSale)
salesRouter.get('/invoices', getCodes)
salesRouter.get('/list', getSales)
salesRouter.post('/make-sale', makeSale)
salesRouter.get('/summary', salesSummary)
salesRouter.delete('/delete-sale', deleteSale)


module.exports = salesRouter