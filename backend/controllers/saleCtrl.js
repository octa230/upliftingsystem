const asyncHandler = require ( 'express-async-handler');
//const PDFDocument = require('pdfkit')
//const fs = require('fs')
const User = require ( '../models/user');
const Sale = require('../models/saleModel')
const { v4: uuidv4} = require('uuid')



const getSales = asyncHandler(async(req, res)=> {
    const sales = await Sale.find()
    res.send(sales)
})


const makeSale = asyncHandler(async(req, res)=> {
    
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
        saleItemsPrice: req.body.totalPrice,
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

const salesSummary = asyncHandler(async(req, res)=> {
    const sales = await Sale.aggregate([
        {
            $group: {
                _id: null,
                salesNum: {$num: 1},
                totalSales: {$num: '$totalPrice'}
            }
        }
    ])

    const users = await User.aggregate([
        {
            $group:{
                _id: null,
                usersNum: {$num: 1}
            }
        }
    ])

    const dailySales = await Sale.aggregate([
        {
            $group:{
                _id: {dateToString: {format: '%Y-%m-%d', date: 'createdAt'}},
                orders: {$sum: 1},
                sales: {$sum: 'totalPrice'}
            }

        },
        {$sort:{_id: 1}}
    ])

    const units = await product.aggregate([
        {
            $group: {
                _id: '$name',
                count: {$sum: 1}
            }
        }
    ])

    res.send({sales, users, dailySales, units})
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

module.exports = {getSales, makeSale, getSingleSale, salesSummary, deleteSale, getCodes}