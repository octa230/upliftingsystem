const express = require('express');
const {getSales, 
    makeSale, 
    getSingleSale, 
    salesSummary, 
    deleteSale,
    makeInvoice,
} = require('../controllers/saleCtrl')



const salesRouter = express.Router();


salesRouter.get('/list', getSales)
salesRouter.post('/make-sale', makeSale)
salesRouter.post('/make-invoice/:id', makeInvoice)
salesRouter.get('/get-sale', getSingleSale)
salesRouter.get('/summary', salesSummary)
salesRouter.delete('/delete-sale', deleteSale)


module.exports = salesRouter