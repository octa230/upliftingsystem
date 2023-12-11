const express = require('express')
const asyncHandler = require('express-async-handler')
const {Product, Transaction} = require('../models/product')


const recordStock = asyncHandler(async(req, res)=> {
    try{
        const {selectedProducts} = req.body

        for(const selectedProduct of selectedProducts){
           // const{product, purchase} = item

            const newProduct = await Product.findById(selectedProduct.product)

            //CHECK AVAILABILITY
            if (!newProduct) {
                return res.status(404).json({ error: "Product not found" });
            }

            ///UPDATE STOCK QUANTITIES
            newProduct.inStock += parseInt(selectedProduct.purchase);
            newProduct.closingStock += parseInt(selectedProduct.purchase);
            newProduct.purchase = selectedProduct.purchase

            newProduct.prruchaseHistory.push({ date: new Date(), purchase: selectedProduct.purchase });

            await newProduct.save()

            ///CREATE TRANSACTION

            const transaction = new Transaction({
                product: selectedProduct.product,
                productName: newProduct.name,
                type: 'purchase',
                quantity: parseInt(selectedProduct.purchase)
            })

            await transaction.save()
        }
        res.status(200).send({ message: "Bulk purchase successful" });
    }catch(error){
        console.log(error)
        res.send(error)
    }
})

module.exports = recordStock


