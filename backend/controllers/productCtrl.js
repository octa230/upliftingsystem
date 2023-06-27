const express = require ("express");
const asyncHandler = require("express-async-handler");
const Product = require ('../models/product'); 



const createProduct = asyncHandler(async(req, res)=> {
    const newProduct = new Product(
        {
            name: req.body.name,
            code: req.body.code,
            price: req.body.price,
            inStock: req.body.inStock
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
const PageSize = 50
const getAll = asyncHandler(async(req, res)=> {
    
    const {query} = req
    const page = query.page || 1;
    const Page_Size = query.Page_Size || PageSize

    const products = await Product.find()
        .skip(PageSize * (page - 1))
        .limit(PageSize);

    const countProducts = await Product.countDocuments();
    res.send({
        products,
        countProducts,
        page,
        Pages: Math.ceil(countProducts / PageSize)
    })
})


const updateProduct = asyncHandler(async(req, res)=> {
const productId = req.params.id
const product = await Product.findById(productId);
if(product){
    product.name= req.body.name,
    product.price = req.body.price,
    product.code = req.body.code,
    product.inStock = req.body.inStock

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

module.exports = {createProduct, deleteProduct, getAll, updateProduct, getProduct}