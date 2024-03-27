const asyncHandler = require("express-async-handler");
const {Product} = require ('../models/product'); 
const mongoose = require('mongoose')
const {Transaction} = require('../models/product')


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

      product.purchaseHistory.push({purchase: product.inStock})
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

const getAll = asyncHandler(async (req, res) => {

  const {searchName} = req.query
  const totalCount = await Product.countDocuments();
  let products;


  if(searchName){
    const searchRegex = new RegExp(searchName, 'i')
    products = await Product.find({name: {$regex: searchRegex}})
  } else {
    products = await Product.find().sort({"name": 1})
  }
  
  const totalValue = products.reduce(
    (accumulator, product) =>
      accumulator + (product.purchasePrice || 0) * (product.inStock || 0),
    0
  );

  res.send({
    products,
    totalCount,
    totalValue,
  });
});

const getProducts = asyncHandler(async(req, res)=> {
    const products = await Product.find().sort({ "name": 1})
    console.log(products)
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

const insermany = asyncHandler(async(req, res)=> {
  try{
    const data = req.body
    const savedData = await Product.insertMany(data)
    res.send(savedData)
  }catch(error){
    res.send(error)
  }
})



module.exports = {namesandprice, insermany, createProduct, aggregatePurchaseHistory, deleteProduct, getAll, updateProduct, getProduct, getAllProducts, getProducts}



