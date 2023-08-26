const express = require ("express");
const asyncHandler = require("express-async-handler");
const Product = require ('../models/product'); 



const createProduct = asyncHandler(async(req, res)=> {
    const {name, code, price, inStock} = req.body
    const newProduct = new Product(
        {
            name: name,
            price: price,
            code: code,
            inStock: inStock
        }
    )
    const product = await newProduct.save();
    res.send({message: 'product added', product})
})


//delete product
const deleteProduct = asyncHandler(async(req, res)=> {
    const productId = req.params.id
    const product = await Product.findByIdAndDelete(productId);

    if(product){
        await product.remove();
        res.send({message: 'product deleted'})
    } else {
        res.status(404).send('Product couldn\'t be found')
    }
})


//list All Products
const PAGE_SIZE  = 20
const getAll = asyncHandler(async(req, res)=> {
    
//    const {query} = req
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * PAGE_SIZE

    const totalCount = await Product.countDocuments();
    const products = await Product.find()
    .skip(startIndex)
    .limit(PAGE_SIZE)
    .exec()

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    res.send({
        products,
        totalPages,
    })
})


const searchProducts = asyncHandler(async (req, res) => {
    const searchName = req.query.searchName || '';
    console.log(searchName)
    try {
      const matchedProducts = await Product.find({
        name: { $regex: searchName, $options: 'i' }
      });
      const products = matchedProducts
      res.send(products);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


const updateProduct = asyncHandler(async(req, res)=> {
const productId = req.params.id
const {name, price, code, purchase} = req.body
const product = await Product.findById(productId);
if(product){
    product.name= name,
    product.price = price,
    product.code = code,
    product.inStock += parseInt(purchase)
    product.purchase = parseInt(purchase)

    await product.save()
    res.send({message: 'product updated successfully'})
}else{
    res.status(404).send({message: 'product not found'})
}
})



const getProduct = asyncHandler(async(req, res)=> {
const productId = req.params.id
const product = await Product.findById(productId)
if(product){
    res.send(product)
}else{
    res.status(404).send({message: 'Product not found'})
}
})

module.exports = {createProduct, deleteProduct, getAll, updateProduct, getProduct, searchProducts}