const asyncHandler = require ( 'express-async-handler');
const PDFDocument = require('pdfkit')
const fs = require('fs')
const User = require ( '../models/user');
const Sale = require('../models/saleModel')



const getSales = asyncHandler(async(req, res)=> {
    const sales = await Sale.find()
    res.send(sales)
})

const makeSale = asyncHandler(async(req, res)=> {
    
    const newSale = new Sale({
        InvoiceCode: req.body.InvoiceCode,
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
    })

    const sale = await newSale.save();
    res.status(201).send({message: 'New sale made', sale})
})

const getSingleSale = asyncHandler(async(req, res)=> {
    const sale = await Sale.findById(req.params._id)
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


const makeInvoice = asyncHandler(async(req, res)=> {
    const saleId = req.params.id;
    const sale = await Sale.findById(saleId)
    
    if(sale){
        try{
        const invoice = new PDFDocument({size: 'A4'});
        const fileName = `invoice_${sale.createdAt.toString()}.pdf`
        const filePath = `./invoices/${fileName}`

        const address = `
                        Uplifting Floral Studio
                        CTRL_NO: ${sale._id}
                        Tel No: +971-00000000. 
                        Mail: sales@uplifting.ae,
                        Site: Uplifting.ae
                        Date: ${sale.createdAt.toLocaleString()}
        `

        const customerInfo = `
        Customer tel:  +971-0000000.
        Customer Name:  Marvin,
        Arrangement:  Box,
        Ivoice Number:  ${sale.InvoiceCode}.
        `
    
        
        invoice.image('./images/logo.png', 50, 30, {fit:[100, 100], width: '200'} )
        invoice.moveDown()
        invoice.text(`${address}`, {align: 'right', lineGap: 4})
        invoice.moveDown()
        invoice.text(`${customerInfo}`, {width: 500, align:'left', lineGap:2})
        invoice.moveDown()
        invoice.fontSize(12).list(sale.saleItems.map((item)=> (`Name: ${item.name}, Qty: ${item.quantity}, Unit Price: ${item.price}`)), {width: '600', align: 'justify', wordSpacing: 8, lineGap: 20, lineBreak: true}, 400, 300)

    
        const writeStream = fs.createWriteStream(filePath)
        
        invoice.pipe(writeStream)
        invoice.end()
        
        writeStream.on('finish', ()=> {res.json({url: `/${fileName}`})})        
        }catch(error){
            res.send(error)
        }
    }
    
})
module.exports = {getSales, makeSale, getSingleSale, salesSummary, deleteSale, makeInvoice}