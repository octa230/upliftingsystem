const SaleDetails = require('../models/saleDetails');
const asyncHandler = require('express-async-handler');
const Product = require('../models/product');

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
        await product.save()
    }
    sale.units.push(
        {arrangement: unitName,
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


/* async function aggregateInvoicesDataForPhone(phoneNumber) {
  const {phone } = req.params.phone
  phoneNumber = phone
  try {
      const pipeline = [
          {
              $match: {
                  "phone": phoneNumber
              }
          },
          {
              $group: {
                  _id: "$phone",
                  invoiceCodes: { $push: "$InvoiceCode" },
                  names: { $push: "$name" },
                  totalAmounts: { $push: "$total" },
                  roundedSum: { $sum: { $round: "$total" } }
              }
          }
      ];

      const results = await SaleDetails.aggregate(pipeline);

      res.send(results);
  } catch (error) {
      console.error("Error aggregating data:", error);
      throw error;
  }
} */

/* (async () => {
  try {
      const phoneNumber = "4343"; // Replace with the desired phone number
      const aggregatedData = await aggregateInvoiceDataForPhone(phoneNumber);
      console.log(aggregatedData);
  } catch (error) {
      console.error("Error:", error);
  }
})(); */


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
/*                     phoneAggregation: [
                        {
                            $group: {
                                _id: "$phone",
                                totalCount: { $sum: 1 },
                                totalAmount: { $sum: "$total" },
                                roundedSum: { $sum: { $round: "$total" } }
                            }
                        }
                    ] */
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
    ]);

    res.send(summary);
} catch (error) {
    res.status(500).json({ message: 'Error retrieving invoice summary' });
}
})

module.exports = {getSales,
  getsingleSale, addSaleUnits, 
  makeSale, salesData, getSalesData, 
  aggregateDataIndependently, customerData
}