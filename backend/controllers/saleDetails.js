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


const PAGE_SIZE = 2

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


const addSaleUnits =  asyncHandler(async(req, res)=> {
    const saleId = req.params.id
    const {selectedProducts, unitName, image} = req.body


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
        photo: image,
        products: selectedProducts.map((x)=> ({
        ...x,
        product: x.product,
        quantity: x.quantity,
    }))})
    
    await sale.save()

    res.status(200).send({message: 'data added successfully'})
    }catch(error){
        console.log(error)
        res.status(500).send({message: 'something went wrong'})

    }
})


const salesData = asyncHandler(async (req, res) => {
    try {
      // Daily sales aggregation with summary
      const dailyData = await SaleDetails.aggregate([
        {
          $group: {
            _id: '$date',
            dailySales: {
              $push: {
                InvoiceCode: '$InvoiceCode',
                date: '$date',
                name: '$name',
                total: '$total'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            dailySales: 1,
            dailySummary: {
              totalSales: { $sum: '$dailySales.total' },
              numSales: { $size: '$dailySales' }
            }
          }
        }
      ]);
  
      // Monthly sales aggregation with summary
      const monthlyData = await SaleDetails.aggregate([
        {
          $group: {
            _id: {
              year: { $year: { $dateFromString: { dateString: '$date' } } },
              month: { $month: { $dateFromString: { dateString: '$date' } } }
            },
            monthlySales: {
              $push: {
                InvoiceCode: '$InvoiceCode',
                date: '$date',
                name: '$name',
                total: '$total'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            monthlySales: 1,
            monthlySummary: {
              totalSales: { $sum: '$monthlySales.total' },
              numSales: { $size: '$monthlySales' }
            }
          }
        }
      ]);
  
      // Yearly sales aggregation with summary
      const annualData = await SaleDetails.aggregate([
        {
          $group: {
            _id: { $year: { $dateFromString: { dateString: '$date' } } },
            yearlySales: {
              $push: {
                InvoiceCode: '$InvoiceCode',
                date: '$date',
                name: '$name',
                total: '$total'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id',
            yearlySales: 1,
            yearlySummary: {
              totalSales: { $sum: '$yearlySales.total' },
              numSales: { $size: '$yearlySales' }
            }
          }
        }
      ]);
  
      res.send({ dailyData, monthlyData, annualData });
    } catch (error) {
      console.log(error);
    }
  });
  

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
    res.status(200).send(sales)
  }catch(err){
    res.status(500).send({err: 'unable to get results'})
  }
}
//phone service and preparedBy
async function aggregateDataIndependently(req, res) {
    try {
        const pipeline = [
            {
                $facet: {
                    serviceAggregation: [
                        {
                            $group: {
                                _id: "$service",
                                totalCount: { $sum: 1 },
                                totalAmount: { $sum: "$total" },
                                roundedSum: { $sum: { $round: "$total" } }
                            }
                        }
                    ],
                    preparedByAggregation: [
                        {
                            $group: {
                                _id: "$preparedBy",
                                totalCount: { $sum: 1 },
                                totalAmount: { $sum: "$total" },
                                roundedSum: { $sum: { $round: "$total" } }
                            }
                        }
                    ],
                }
            }
        ];

        const results = await SaleDetails.aggregate(pipeline);

        res.send(results);
    } catch (error) {
        console.error("Error aggregating data:", error);
        throw error;
    }
}

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
  makeSale, salesData, getSalesData, 
  aggregateDataIndependently, customerData
}