const express = require('express');
const {getSales, 
    makeSale, 
    getSingleSale, 
    salesSummary, 
    deleteSale,
    getCodes
} = require('../controllers/saleCtrl')



const salesRouter = express.Router();

salesRouter.get('/invoices', getCodes)
salesRouter.get('/get-sale/:id', getSingleSale)
salesRouter.get('/list', getSales)
salesRouter.post('/make-sale', makeSale)
salesRouter.delete('/delete-sale', deleteSale)


module.exports = salesRouter