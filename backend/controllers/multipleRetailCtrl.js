const MultipleSale = require('../models/MultipleRetail');
const asyncHandler = require('express-async-handler');
const Product = require('../models/product');

const makeSale = asyncHandler(async(req, res)=> {
        const newSale = new MultipleSale({
            saleItems: req.body.products.map((x)=> ({
                ...x,
                quantity: x.quantity,
                productName: x.name,
                price: x.price,
                arrangement: x.arrangement,
                photo: x.file
            })),
            preparedBy: req.body.preparedBy,
            paidBy: req.body.paidBy,
            service: req.body.service,
            date: req.body.time,
            phone: req.body.phone,
            name: req.body.name,
            units:[],
            subTotal: req.body.subTotal,
            total: req.body.total,
            InvoiceCode: req.body.invoiceNumber,
        })
    
        const sale = await newSale.save()
        res.status(201).send({message: 'sale recorded successfully', sale})
}) 


const PAGE_SIZE = 30

const getSales = asyncHandler(async(req, res)=> {
    const {query} = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE

    const sales = await MultipleSale.find().sort({createdAt: -1})   
        .skip(pageSize * ( page - 1))
        .limit(pageSize)

    const countSales = await MultipleSale.countDocuments();
    res.send({
        sales, page,
        countSales,
        Pages: Math.ceil(countSales / pageSize)
    })
})

const getsingleSale = asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const sale = await MultipleSale.findById(saleId)
    if(sale){
        res.send(sale)
    }else{
        res.status(404).send({message: "sale not found"})
    }
})

const addSaleUnits = asyncHandler(asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const sale = await MultipleSale.findById(saleId) 
    const {selectedProducts, arrangement} = req.body
    if(sale){
        sale.units.push({arrangement, products: selectedProducts.map((x)=> ({
            ...x,
            product: x.product,
            quantity: x.quantity
        }))})
    await sale.save();
    }else{
        res.status(404).send({message: "unable to add data"})
    }


    sale.units.push({arrangement, ...newProducts})
}))


module.exports = {getSales, getsingleSale, addSaleUnits, makeSale}