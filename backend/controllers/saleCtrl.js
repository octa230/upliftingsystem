const asyncHandler = require ( 'express-async-handler');
//const PDFDocument = require('pdfkit')
//const fs = require('fs')
const User = require ( '../models/user');
const Sale = require('../models/saleModel')
const { v4: uuidv4} = require('uuid');
const {Product, Transaction} = require('../models/product');



const getSales = asyncHandler(async(req, res)=> {
    const sales = await Sale.find()
    res.send(sales)
})


const makeSale = asyncHandler(async(req, res)=> {
    

    for(const product of req.body.saleItems){
        const dbProduct = await Product.findById(product._id)

        if(!dbProduct){
            return res.status(404).send(`Product ${product} not Found`)
        }
        if(dbProduct.inStock < product.quantity){
            res.status(400).send('inSufficient stock')
        }

        dbProduct.inStock -= product.quantity
        dbProduct.closingStock -= product.quantity
        dbProduct.sold += product.quantity
        await dbProduct.save()

        const transaction = new Transaction({
            product: product._id,
            productName: dbProduct.name,
            purchasePrice: dbProduct.purchasePrice,
            sellingPrice: dbProduct.price,
            type: 'sale',
            quantity: product.quantity
        })

        await transaction.save()
    }
    const uuid =()=> `CDFDXB/W_${uuidv4().substring(0, 6)}`
    const newSale = new Sale({
        InvoiceCode: uuid(),
        saleItems: req.body.saleItems.map((x)=> ({
            ...x, 
            product: x._id,
            name: x.name,
            quantity: x.quantity,
            price: x.price

        })),
        totalPrice: req.body.totalPrice,
        preparedBy: req.body.preparedBy,
        paidBy: req.body.paidBy,
        service: req.body.service,
        date: req.body.date,
        taxPrice: req.body.taxPrice,
        saleItemsPrice: req.body.itemsPrice,
        phone: req.body.phone,
        customer: req.body.customer,
        free: req.body.free,
        orderedBy: req.body.orderedBy,
        recievedBy: req.body.recievedBy,
        discount: req.body.discount,
        driver: req.body.driver,
        deliveredTo: req.body.deliveredTo
    })

    const sale = await newSale.save();
    res.status(201).send({message: 'New sale made', sale})
})

const getSingleSale = asyncHandler(async(req, res)=> {
    const sale = await Sale.findById(req.params.id)
    if(sale){
        res.send(sale)
    } else {
        res.status(404).send({message: 'sale not found'})
    }
})

const deleteSale = asyncHandler(async(req, res)=> {
    const sale = await Sale.findById(req.params.id)
    if(sale){
        await sale.remove()
        res.send({message: 'sale deleted successfully'})
    }
})


const getCodes = asyncHandler(async(req, res)=> {
    try{
        const codes = await Sale.find({}, ['InvoiceCode', 'totalPrice'])
        
        if(codes){
            const tenCodes = codes.slice(-10)
            res.send({tenCodes})
        }else{
            res.send('unable to fetch codes')
        }
    }catch(error){
        res.send(error)
        console.log(error)
    }
    //console.log(codes)
}) 

module.exports = {getSales, makeSale, getSingleSale, deleteSale, getCodes}