const SaleDetails = require('../models/saleDetails');
const asyncHandler = require('express-async-handler');
const Product = require('../models/product');
const upload = require('../utils/upload')

const makeSale = asyncHandler(async(req, res)=> {
        const newSale = new SaleDetails({
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

    const sales = await SaleDetails.find()   
    const countSales = await SaleDetails.countDocuments();
    res.send({
        sales,
        countSales,
    })
})

const getsingleSale = asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const sale = await SaleDetails.findById(saleId)
    if(sale){
        res.send(sale)
    }else{
        res.status(404).send({message: "sale not found"})
    }
})

/* const addSaleUnits = asyncHandler(asyncHandler(async(req, res)=> {
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
 */




const addSaleUnits =  asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const {selectedProducts, unitName} = req.body
    const images = req.files.map((file)=> file.filename)


    if(!saleId){
        res.status(404).send('no sale found');
        return
    } 
    try{
    
    const sale = await SaleDetails.findById(saleId)
    if (!selectedProducts || !Array.isArray(selectedProducts) || selectedProducts.length === 0) {
        return res.status(400).json({ error: 'No products or quantities submitted' });
    }
    if(!sale){
        return res.status(404).json({ error: 'Sale not found' });
    }
    for(const selectedProduct of selectedProducts){
        const product = await Product.findById(selectedProduct.product)
        if(!product){
            res.status(404).send(`product${selectedProduct.product} not found`)
            return
        }
        if(product.inStock < selectedProduct.quantity){
            res.status(400).send('insufficient stock')
            return
        }
        product.inStock -= selectedProduct.quantity
        await product.save()
    }
    sale.units.push(
        {arrangement: unitName, images: images,
        products: selectedProducts.map((x)=> ({
        ...x,
        product: x.product,
        name: x.name,
        quantity: x.quantity,
    }))})
    
    await sale.save()
    res.status(200).send({message: 'data added successfully'})
    }catch(error){
        console.log(error)
        res.status(500).send({message: 'something went wrong'})

    }


})

module.exports = {getSales, getsingleSale, addSaleUnits, makeSale}