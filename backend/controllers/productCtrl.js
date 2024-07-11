const asyncHandler = require("express-async-handler");
const {Product} = require ('../models/product'); 
const mongoose = require('mongoose')
const {Transaction} = require('../models/product')


const getStock = asyncHandler(async(req, res)=> {
  let matchQuery = {}
  if(req.query.stockStatus === 'in'){
    matchQuery = { inStock: { $gt: 0 } }
  }else if (req.query.stockStatus === 'out') {
    matchQuery = { inStock: { $eq: 0 } };
  } else {
    matchQuery = { inStock: { $gt: 0 } };
  }
  const products = await Product.aggregate([
    {$match: matchQuery},
    {$sort: { "name": 1}}
  ])
  res.send(products)
})




const createProduct = asyncHandler(async(req, res)=> {
    const {name, code, price, inStock, purchasePrice} = req.body
    const newProduct = new Product(
        {
            name: name.toUpperCase(),
            price: price,
            code: code.toUpperCase(),
            inStock: inStock,
            purchase: inStock,
            purchasePrice: purchasePrice,
            closingStock: inStock,
        }
    )
    const product = await newProduct.save();
    if(product){
      const transaction = new Transaction({
        product: product._id,
        type: 'purchase',
        productName: product.name,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.price,
        quantity: product.inStock
      })
      await transaction.save()

      //product.purchaseHistory.push({purchase: product.inStock})
      await product.save()
    }
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
//const PAGE_SIZE = 20;

const searchProducts = asyncHandler(async (req, res) => {
  const searchName = req.query.searchName
  const products = await Product.aggregate([
    {
      $match:{
        $or: [
          {name: {$regex: searchName, $options: 'i'}},
          {code: {$regex: searchName, $options: 'i'}}
        ]
      }
    }
  ])
  res.send(products)
});

const getProducts = asyncHandler(async(req, res)=> {
    const products = await Product.find().sort({ "name": 1})
    //console.log(products)
    res.send(products)

})


//getAllproductsByIdAndName

const getAllProducts = asyncHandler(async(req, res)=> {
    const products = await Product.find({}, "name").sort({"name": 1});
    //const productNames = products.map(product => product.name); // Extract names from the products
    res.send(products);
})

const namesandprice = asyncHandler(async(req, res)=> {
  const products = await Product.find().select(["name", "price", "purchasePrice"])
  res.send(products)
})


const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const { name, price, code, purchase, purchasePrice } = req.body;
    const product = await Product.findById(productId);
  
    if (product) {
      product.name = name;
      product.price = price;
      product.code = code.toUpperCase();
      product.purchasePrice = purchasePrice;
  
      if (purchase) {
        const purchaseAmount = parseInt(purchase);
        product.purchaseHistory.push({ purchase: purchaseAmount });
  
        const transaction = new Transaction({
          product: product._id,
          type: 'purchase',
          productName: product.name,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.price,
          quantity: purchaseAmount,
        });
  
        await transaction.save();
  
        product.inStock += purchaseAmount;
        product.closingStock += purchaseAmount;
        product.purchase += purchaseAmount;
      }
  
      await product.save();
  
      res.send({ message: 'Product updated successfully' });
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  });


const getProduct = asyncHandler(async(req, res)=> {
const productId = req.params.id
const product = await Product.findById(productId)
if(product){
    res.send(product)
}else{
    res.status(404).send({message: 'Product not found'})
}
})



module.exports = {getStock, namesandprice, createProduct, deleteProduct, updateProduct, getProduct, getAllProducts, getProducts, searchProducts}



