const express = require('express');
const {createProduct, 
    deleteProduct, getAll, 
    updateProduct, getProduct, 
    searchProducts, getAllProducts} = require('../controllers/productCtrl')

const productRouter = express.Router();


productRouter.get('/names', getAllProducts)
productRouter.post('/new', createProduct)
productRouter.delete('/delete/:id', deleteProduct)
productRouter.get('/list', getAll)
productRouter.put('/update/:id', updateProduct)
productRouter.get('/:id', getProduct)
productRouter.get('/search', searchProducts)

module.exports = productRouter