const express = require('express');
const {createProduct, deleteProduct, getAll, updateProduct, productName, getProduct} = require('../controllers/productCtrl')

const productRouter = express.Router();


productRouter.post('/new', createProduct)
productRouter.delete('/delete/:id', deleteProduct)
productRouter.get('/list', getAll)
productRouter.put('/update/:id', updateProduct)
productRouter.get('/:id', getProduct)

module.exports = productRouter