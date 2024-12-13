const asyncHandler = require("express-async-handler");
const {Product} = require ('../models/product'); 
const {Transaction} = require('../models/product')


const getStock = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Check for stock status (in or out)
  if (req.query.stockStatus === 'in') {
    matchQuery.inStock = { $gt: 0 };  // Products with inStock > 0
  } else if (req.query.stockStatus === 'out') {
    matchQuery.inStock = { $eq: 0 };  // Products with inStock == 0
  } 

  // Check if identifier is provided, and apply to match query
  if (req.query.identifier) {
    matchQuery.identifier = { $eq: req.query.identifier }; // Match by identifier
  }

  // Default case: match in-stock products if no specific filters
  if (!req.query.stockStatus && !req.query.identifier) {
    matchQuery.inStock = { $gt: 0 };  // Default to in-stock products
  }

  // Aggregate query to find products based on the constructed matchQuery
  const products = await Product.aggregate([
    { $match: matchQuery },  // Apply filter based on stockStatus and identifier
    { $sort: { name: 1 } }    // Sort products by name (ascending order)
  ]);

  res.send(products);  // Send filtered products
});




const createProduct = asyncHandler(async(req, res)=> {
    const {name, code, price, inStock, purchasePrice, identifier, photo} = req.body
    const newProduct = new Product(
        {
            name: name.toUpperCase(),
            price: price,
            code: code.toUpperCase(),
            photo: photo,
            inStock: inStock,
            purchase: inStock,
            purchasePrice: purchasePrice,
            identifier: identifier.toUpperCase(),
            closingStock: inStock,
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
    const { name, price, code, purchase, purchasePrice, photo, identifier } = req.body;
    const product = await Product.findById(productId);
  
    if (product) {
      product.name = name;
      product.price = price;
      product.code = code.toUpperCase();
      product.purchasePrice = purchasePrice;
      product.identifier = identifier
      product.photo = photo
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



