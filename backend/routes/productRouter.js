const express = require('express');
const {createProduct, 
    deleteProduct, getAll,
    updateProduct, getProduct, 
    getAllProducts, getProducts, aggregatePurchaseHistory,  namesandprice, 
    searchProducts,
    getStock} = require('../controllers/productCtrl')

const productRouter = express.Router();


productRouter.get('/prices', namesandprice)
productRouter.get('/stock-only', getStock)
productRouter.get('/names', getAllProducts)
productRouter.post('/new', createProduct)
productRouter.delete('/delete/:id', deleteProduct)
productRouter.put('/update/:id', updateProduct)
productRouter.get('/search', searchProducts)
productRouter.get('/all', getProducts)
productRouter.get('/:id', getProduct)

module.exports = productRouter