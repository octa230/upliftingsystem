const asyncHandler = require('express-async-handler')
const {Product, Transaction} = require('../models/product')
const StockRecord = require('../models/StockRecord')
const Purchase = require('../models/Purchase')


const recordStock = asyncHandler(async(req, res)=> {
    try{
        const {selectedProducts, deliveryNote, total} = req.body


        const existPurchase = await Purchase.findOne({deliveryNote})

        if(existPurchase){
            res.send(existPurchase)
        }

        const newPurchase = new Purchase({
            deliveryNote: deliveryNote,
            Items: selectedProducts,
            total: total
        })

        await newPurchase.save()

        for(const selectedProduct of selectedProducts){

            const newProduct = await Product.findById(selectedProduct.product)

            if (!newProduct) {
                return res.status(404).json({ error: "Product not found" });
            }

            newProduct.inStock += parseInt(selectedProduct.quantity);
            newProduct.closingStock += parseInt(selectedProduct.quantity);
            newProduct.purchase += parseInt(selectedProduct.quantity)


            await newProduct.save()


            const transaction = new Transaction({
                product: selectedProduct.product,
                purchasePrice: newProduct.purchasePrice,
                sellingPrice: newProduct.price,
                productName: newProduct.name,
                type: 'purchase',
                quantity: parseInt(selectedProduct.quantity)
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
        console.log(typeof(data))
        //res.send(data);
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


