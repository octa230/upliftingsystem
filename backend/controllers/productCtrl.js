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
  const { year, month, name } = req.query;

  try {
    let query = {};

    // Apply filters based on query parameters
    if (year) {
      query['prruchaseHistory.date'] = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1),
      };
    }

    if (month) {
      // If 'prruchaseHistory.date' already exists in the query, use $and to combine conditions
      query = {
        $and: [
          query,
          {
            'prruchaseHistory.date': {
              $gte: new Date(new Date().getFullYear(), month - 1, 1),
              $lt: new Date(new Date().getFullYear(), month, 1),
            },
          },
        ],
      };
    }

    if (name) {
      query.name = name;
    }

    // Query the database to get total purchase history for all products
    const products = await Product.find(query);

    const tableData = [];

    products.forEach((product) => {
      let productTotalPurchases = 0;

      const productWisePurchases = product.prruchaseHistory.map((entry) => {
        productTotalPurchases += entry.purchase;

        return {
          date: entry.date,
          purchase: entry.purchase,
        };
      });

      const rowData = {
        productCode: product.code,
        productName: product.name,
        productTotalPurchases,
        productWisePurchases,
      };

      tableData.push(rowData);
    });

    res.json(tableData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  


module.exports = {createProduct, aggregatePurchaseHistory, deleteProduct, getAll, updateProduct, getProduct, searchProducts, getAllProducts, getProducts}