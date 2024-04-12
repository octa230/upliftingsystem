const SaleDetails = require('../models/saleDetails');
const asyncHandler = require('express-async-handler');
const {Product} = require('../models/product');
const { v4: uuidv4 } = require('uuid');
const {Transaction} = require('../models/product')

const makeSale = asyncHandler(async(req, res)=> {

        const uuid =()=> `CDFDXB_${uuidv4().substring(0, 6)}`

        const newSale = new SaleDetails({
            saleItems: req.body.products.map((x)=> ({
                ...x,
                quantity: x.quantity,
                productName: x.name,
                price: x.price,
                arrangement: x.arrangement,
                photo: x.photo
            })),
            preparedBy: req.body.preparedBy,
            paidBy: req.body.paidBy,
            service: req.body.service,
            date: req.body.time,
            phone: req.body.phone,
            name: req.body.name,
            units:[],
            free: req.body.free,
            discount: req.body.discount,
            deliveredTo: req.body.deliveredTo,
            orderedBy: req.body.orderedBy,
            recievedBy: req.body.recievedBy,
            driver: req.body.driver,
            subTotal: req.body.subTotal,
            total: req.body.total,
            vat: req.body.vat,
            InvoiceCode: uuid(),
        })
    
        const sale = await newSale.save()
        res.status(201).send({message: 'sale recorded successfully', sale})
}) 


const todaySales = asyncHandler(async (req, res) => {
  // Get today's date
  const today = new Date();
  // Set the start of the day (midnight)
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  // Set the end of the day (just before midnight)
  const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Retrieve sales data for today
  const sales = await SaleDetails.find({
    createdAt: {
      $gte: dayStart,
      $lt: dayEnd
    }
  });

  res.status(200).send(sales);
});


const getSales = asyncHandler(async(req, res)=> {

    const sales = await SaleDetails.find({}).sort({createdAt: -1})
    //.limit(10)  
    res.send(sales)
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


const addSaleUnits =  asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const {selectedProducts, unitName} = req.body


    if(!saleId){
        res.status(404).send('no sale found');
        return
    } 
    try{
    
    const sale = await SaleDetails.findById(saleId)
    if (!selectedProducts || selectedProducts.length === 0) {
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
        product.closingStock -= selectedProduct.quantity
        product.sold += parseInt(selectedProduct.quantity)
        await product.save()

        const transaction = new Transaction({
          product: selectedProduct.product,
          productName: product.name,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.price,
          type: 'sale',
          quantity: selectedProduct.quantity
        })

        await transaction.save()
    }
    sale.units.push({
        arrangement: unitName,
        products: selectedProducts.map((x)=> ({
        ...x,
        product: x.product,
        productName: x.productName,
        quantity: x.quantity,
    }))})
    
    await sale.save()

    res.status(200).send({message: 'data added successfully'})
    }catch(error){
        console.log(error)
        res.status(500).send({message: 'something went wrong'})

    }
})


const getSalesData = asyncHandler(async(req, res)=> {
    const salesData = await SaleDetails.aggregate([
        {
          $group: {
            _id: {
              year: { $year: { $dateFromString: { dateString: '$date' } } },
              month: { $month: { $dateFromString: { dateString: '$date' } } },
              day: { $dayOfMonth: { $dateFromString: { dateString: '$date' } } }
            },
            dailySales: { $push: '$$ROOT' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month'
            },
            monthlySales: { $push: '$$ROOT' },
            monthlySummary: {
              $push: {
                date: '$_id',
                totalSales: { $sum: '$dailySales.total' },
                numSales: { $size: '$dailySales' }
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.year',
            yearlySales: { $push: '$$ROOT' },
            yearlySummary: {
              $push: {
                year: '$_id',
                totalSales: { $sum: '$monthlySummary.totalSales' },
                numSales: { $sum: '$monthlySummary.numSales' }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            dailySales: 1,
            monthlySales: 1,
            yearlySales: 1,
            dailySummary: '$monthlySales.monthlySummary',
            monthlySummary: 1,
            yearlySummary: 1
          }
        }
      ]);
    res.send(salesData)
})


// Controller to retrieve sales for a given day and month

async function querySalesData(req, res){
  const {day, month, year}= req.query;
  const query = {}

  if (year) {
    query['date'] = { $regex: `.*${year}` };
  }

  if (month && day) {
    query['date'] = { $regex: `^${day}/${month}/` };
  } else if (month) {
    query['date'] = { $regex: `^\\d{2}/${month}/` };
  } else if (day) {
    query['date'] = { $regex: `^${day}/\\d{2}/` };
  }

  try{
    const sales = await SaleDetails.find(query)

    const totalCount = sales.length; // Total number of sales
    const totalValue = sales.reduce((acc, sale) => acc + (isNaN(sale.total) ? 0 : sale.total), 0); // Total value
    const foc = sales.filter((sale)=> sale.free === true)
    const focSales = foc.reduce((acc, sale)=> acc + (isNaN(sale.total) ? 0 : sale.total), 0)
    res.status(200).send({ sales, totalCount, totalValue, focSales});
    //console.log({ sales, totalCount, totalValue })
  }catch(err){
    res.status(500).send({err: 'unable to get results'})
  }
}

const searchSale = asyncHandler(async(req, res)=> {
  const searchText = req.query.searchText
  const sales = await SaleDetails.aggregate([
    {
      $match:{
        $or:[
          {InvoiceCode: {$regex: searchText, $options: 'i' }},
          {phone: {$regex: searchText, $options: 'i'}}
        ]
      }
    }
  ])
  res.send(sales)
})


const customerData = asyncHandler(async(req, res)=> {
  try {
    const summary = await SaleDetails.aggregate([
        {
            $group: {
                _id: '$phone',
                name: { $first: '$name' },
                totalInvoices: { $sum: 1 },
                totalAmount: { $sum: '$total' },
            }
        }
    ])
    res.send(summary);
} catch (error) {
    res.status(500).json({ message: 'Error retrieving invoice summary' });
}
})





module.exports = {getSales, querySalesData,
  getsingleSale, addSaleUnits,
  makeSale, getSalesData, todaySales,
  customerData, searchSale
}