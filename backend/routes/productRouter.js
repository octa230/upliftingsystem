const express = require('express');
const {createProduct, 
    deleteProduct, getAll, insermany,
    updateProduct, getProduct, 
    getAllProducts, getProducts, aggregatePurchaseHistory,  namesandprice} = require('../controllers/productCtrl')

const productRouter = express.Router();



productRouter.get('/prices', namesandprice)
productRouter.get('/names', getAllProducts)
productRouter.post('/seed', insermany)
productRouter.post('/new', createProduct)
productRouter.get('/purchase-history', aggregatePurchaseHistory)
productRouter.delete('/delete/:id', deleteProduct)
productRouter.get('/list', getAll)
productRouter.put('/update/:id', updateProduct)
productRouter.get('/all', getProducts)
productRouter.get('/:id', getProduct)

module.exports = productRouter