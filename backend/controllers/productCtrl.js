const express = require ("express");
const asyncHandler = require("express-async-handler");
const Product = require ('../models/product'); 
const mongoose = require('mongoose')


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

const getProducts = asyncHandler(async(req, res)=> {
    const products = await Product.find({})
    res.send(products)

})
//getAllproductsByIdAndName

const getAllProducts = asyncHandler(async(req, res)=> {
    const products = await Product.find({}, "name");
    //const productNames = products.map(product => product.name); // Extract names from the products
    res.send(products);
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
    product.name = name,
    product.price = price,
    product.code = code,

    purchaseAmount = parseInt(purchase);
    product.prruchaseHistory.push({purchase: purchaseAmount})
    product.inStock += parseInt(purchase)
    product.purchase = purchaseAmount
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



///PURCHASE HOSTORY
const aggregatePurchaseHistory = asyncHandler(async (req, res) => {
  //const { day, year, month, name } = req.query;

  try {
    const { year, month, day, product } = req.query;

    // Build match conditions based on query parameters
    const matchConditions = {};
    if (year) matchConditions['prruchaseHistory.date'] = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
    if (month) matchConditions['prruchaseHistory.date'] = { ...matchConditions['prruchaseHistory.date'], $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month) + 1}-01`) };
    if (day) matchConditions['prruchaseHistory.date'] = { ...matchConditions['prruchaseHistory.date'], $gte: new Date(`${year}-${month}-${day}`), $lt: new Date(`${year}-${month}-${parseInt(day) + 1}`) };
    if (product) matchConditions['_id'] = mongoose.Types.ObjectId(product);
   
    const aggregationPipeline = [
      { $match: matchConditions },
      { $unwind: "$prruchaseHistory" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          totalPrice: { $sum: "$prruchaseHistory.purchase" },
          totalPurchases: { $sum: 1 },
          date: { $first: "$prruchaseHistory.date" }
        }
      },
      {
        $group: {
          _id: null,
          purchases: { $sum: "$totalPurchases" },
          totalPrice: { $sum: "$totalPrice" },
          results: { $push: "$$ROOT" }
        }
      }
    ];

    //const result = await Product.aggregate(aggregationPipeline);
    const result = await Product.aggregate(aggregationPipeline);
    
   // Check if 'results' array exists before accessing its properties
   const finalResult = result[0]?.results?.map(item => ({
    ProductID: item._id,
    Name: item.name,
    TotalPrice: item.totalPrice,
    TotalPurchases: item.totalPurchases,
    Date: item.date?.toLocaleDateString() // Convert date to human-readable format
  })) || [];

  // Add total purchases and total price to the result
  finalResult.push({
    ProductID: 'Total',
    Name: 'Overall Total',
    TotalPrice: result[0]?.totalPrice || 0,
    TotalPurchases: result[0]?.purchases || 0,
    Date: '' // No specific date for the total
  });

    //console.log(finalResult)
    res.status(200).send(finalResult)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  


module.exports = {createProduct, aggregatePurchaseHistory, deleteProduct, getAll, updateProduct, getProduct, searchProducts, getAllProducts, getProducts}