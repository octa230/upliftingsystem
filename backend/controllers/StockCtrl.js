const asyncHandler = require('express-async-handler')
const {Product, Transaction} = require('../models/product')
const StockRecord = require('../models/StockRecord')


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
            newProduct.purchase += parseInt(selectedProduct.purchase)

            newProduct.purchaseHistory.push({ date: new Date(), purchase: selectedProduct.purchase });

            await newProduct.save()

            ///CREATE TRANSACTION

            const transaction = new Transaction({
                product: selectedProduct.product,
                purchasePrice: newProduct.purchasePrice,
                sellingPrice: newProduct.price,
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

const getStockRecord = asyncHandler(async(req, res)=> {

    try {
        const { day, month, year } = req.query;
        const DAY = parseInt(day);
        const MONTH = parseInt(month);
        const YEAR = parseInt(year);

        //console.log(YEAR, DAY, MONTH);

        const startDate = new Date(YEAR, MONTH - 1, DAY);
        const endDate = new Date(YEAR, MONTH - 1, DAY + 1);

        const data = await StockRecord.find({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            }
        });

        res.send(data);
        //console.log(record);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})


const getAllRecords = asyncHandler(async(req, res)=> {
    const data = await StockRecord.find({})
    res.send(data)
})
module.exports = {recordStock, getStockRecord, getAllRecords}


