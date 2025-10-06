import expressAsyncHandler from 'express-async-handler'
import { Router } from 'express'
import { Purchase, Sale } from '../models/Transactions.js'
import { Expense } from '../models/expense.js'
import { Transaction, Product } from '../models/product.js'



const TransactionRouter = Router()


TransactionRouter.post(
  '/purchase',
  expressAsyncHandler(
    async (req, res) => {
      try {
        const { selectedProducts, deliveryNote, total } = req.body


        const newPurchase = new Purchase({
          deliveryNote: deliveryNote,
          Items: selectedProducts,
          total: total
        })

        await newPurchase.save()

        for (const selectedProduct of selectedProducts) {

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
            deliveryNote: deliveryNote,
            quantity: parseInt(selectedProduct.quantity)
          })

          await transaction.save()
        }
        res.status(200).send({ message: "Bulk purchase successful" });
      } catch (error) {
        console.log(error)
        res.send(error)
      }
    }
  )
)


TransactionRouter.post(
  '/damages',
  expressAsyncHandler(
    async (req, res) => {
      try {
        const { selectedProducts, display } = req.body

        for (const selectedProduct of selectedProducts) {

          const newProduct = await Product.findById(selectedProduct.product)

          //CHECK AVAILABILITY
          if (!newProduct) {
            return res.status(404).json({ error: "Product not found" });
          }

          ///UPDATE STOCK QUANTITIES
          if (selectedProduct.quantity > newProduct.inStock || selectedProduct.quantity > newProduct.closingStock) {
            res.status(400).send({ message: 'Insufficient stock' })
            return
          }
          newProduct.waste += parseInt(selectedProduct.quantity)
          newProduct.inStock -= parseInt(selectedProduct.quantity);
          newProduct.closingStock -= parseInt(selectedProduct.quantity);

          await newProduct.save()

          ///CREATE TRANSACTION

          const transaction = new Transaction({
            product: selectedProduct.product,
            productName: newProduct.name,
            purchasePrice: newProduct.purchasePrice,
            type: display ? 'display' : 'damage',
            quantity: parseInt(selectedProduct.quantity)
          })

          await transaction.save()
        }
        res.status(200).send({ message: "Bulk record succeded" });
      } catch (error) {
        console.log(error)
        res.send(error)
      }
    }
  )
)

///UPDATE PURCHASE DATA
TransactionRouter.put(
  '/:deliveryNote',
  expressAsyncHandler(async (req, res) => {
    const { purchase, total, type } = req.body
    const { deliveryNote } = req.params
    try {
      const dbPurchase = await Purchase.findOne({ deliveryNote })


      if (!dbPurchase) {
        res.status(404).send({ message: "Purchase not Found" })
        return
      }

      dbPurchase.Items = purchase.Items
      dbPurchase.total = total

      for (const product of purchase.Items) {

        const newProduct = await Product.findById(product.product)

        if (!newProduct) {
          return res.status(404).json({ error: "Product not found" });
        }

        const quantityToReturn = parseInt(product.quantity);
        newProduct.inStock -= quantityToReturn;
        newProduct.closingStock -= quantityToReturn;
        newProduct.returned += quantityToReturn;


        await newProduct.save()


        const transaction = new Transaction({
          product: product.product,
          purchasePrice: newProduct.purchasePrice,
          sellingPrice: newProduct.price,
          productName: newProduct.name,
          type: type,
          deliveryNote: deliveryNote,
          quantity: parseInt(product.quantity)
        })

        await transaction.save()
      }
      res.status(200).send({ message: "Bulk Successful" });

      await dbPurchase.save()

    } catch (error) {
      res.send(error)
    }
  })
)


TransactionRouter.get(
  '/records',
  expressAsyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, productName, type, limit } = req.query;
      const query = {};

      if (
        startDate &&
        endDate &&
        !isNaN(Date.parse(startDate)) &&
        !isNaN(Date.parse(endDate))
      ) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
            .setHours(23, 59, 59, 999)
        };
      }

      if (productName) {
        query.productName = productName;
      }

      if (type) {
        query.type = type;
      }

      const parsedLimit = parseInt(limit);
      const safeLimit = isNaN(parsedLimit) ? 100 : parsedLimit;

      //console.log(query)

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(safeLimit);

      let totalQuantity = 0;
      let totalPrice = 0;

      transactions.forEach(t => {
        totalQuantity += t.quantity;
        totalPrice += t.quantity * t.purchasePrice;
      });
      //console.log(transactions)
      res.send({
        data: transactions,
        totals: { totalQuantity, totalPrice }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  })
);



TransactionRouter.get('/daily-summary', expressAsyncHandler(async(req, res)=> {
  const { date } = req.query;
  
  // If date is provided, use it; otherwise use today
  const targetDate = date ? new Date(date) : new Date();
  
  // Set to start of day (00:00:00)
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Set to end of day (23:59:59)
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Purchases
  const purchases = await Purchase.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$total' }
            }
          }
        ],
        records: [
          { $match: {} }
        ]
      }
    }
  ]);
  
  // Sales
  const sales = await Sale.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$total' }
            }
          }
        ],
        records: [
          {$unset: 'saleItems'},
          { $match: {} }
        ]
      }
    }
  ]);
  
  // Damages (from Transaction collection)
  const damages = await Transaction.aggregate([
    {
      $match: {
        type: 'damage',
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$amount' }
            }
          }
        ],
        records: [
          { $match: {} }
        ]
      }
    }
  ]);
  
  // Expenses (separate collection)
  const expenses = await Expense.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: '$amount' }
            }
          }
        ],
        records: [
          { $match: {} }
        ]
      }
    }
  ]);
  
  // Format response
  res.json({
    date: targetDate.toLocaleDateString('en-GB'),
      purchases: {
        count: purchases[0].summary[0]?.count || 0,
        total: purchases[0].summary[0]?.total || 0,
        data: purchases[0].records
      },
      sales: {
        count: sales[0].summary[0]?.count || 0,
        total: sales[0].summary[0]?.total || 0,
        data: sales[0].records
      },
      damages: {
        count: damages[0].summary[0]?.count || 0,
        total: damages[0].summary[0]?.total || 0,
        data: damages[0].records
      },
      expenses: {
        count: expenses[0].summary[0]?.count || 0,
        total: expenses[0].summary[0]?.total || 0,
        data: expenses[0].records
      }
  });
}));

TransactionRouter.get(
  '/daily-report',
  expressAsyncHandler(
    async (req, res) => {
      const { date, type, } = req.query
      if (type === 'purchase') {
        try {
          const data = await Purchase.find({
            createdAt: {
              $gte: new Date(date),
              $lt: new Date(date + 'T23:59:59.999Z')
            }
          });
          res.send(data)
          //console.log(data)
        } catch (error) {
          console.log(error)
        }
      } else if (type === 'closing') {
        try {
          let today = new Date().toISOString().split('T')[0]
          let data;
          if (today === date) {
            data = await Product.aggregate([
              {
                $match: {
                  $or: [
                    { inStock: { $gt: 0 } },
                    { purchase: { $gt: 0 } },
                    { waste: { $gt: 0 } },
                    { sold: { $gt: 0 } }
                  ]
                }
              },
              {
                $group: {
                  _id: null,
                  products: {
                    $push: {
                      name: "$name",
                      purchase: "$purchase",
                      sold: "$sold",
                      waste: "$waste",
                      closingStock: "$closingStock"
                    }
                  },
                  totalPurchase: { $sum: { $multiply: ["$purchase", "$purchasePrice"] } },
                  totalSold: { $sum: { $multiply: ["$sold", "$purchasePrice"] } },
                  totalWaste: { $sum: { $multiply: ["$waste", "$purchasePrice"] } },
                  totalClosingStock: { $sum: { $multiply: ["$closingStock", "$purchasePrice"] } }
                }
              },
              {
                $project: {
                  _id: 0,
                  products: 1,
                  totalPurchase: 1,
                  totalSold: 1,
                  totalWaste: 1,
                  totalClosingStock: 1
                }
              }
            ]);
          } else {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            data = await StockRecord.findOne({
              createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
              }
            });
          }
          //console.log(data)
          res.send(data)
        } catch (error) {
          res.send(error)
        }

      } else if (type === 'sales') {
        try {
          const data = await Transaction.find({
            createdAt: {
              $gte: new Date(date),
              $lte: new Date(date + 'T23:59:59.999Z')
            },
            type: "sale"
          })
          res.send(data)
        } catch (error) {
          console.log(error)
        }
      } else if (type === 'damages') {
        try {
          const data = await Transaction.find({
            createdAt: {
              $gte: new Date(date),
              $lte: new Date(date + "T23:59:59.999Z")
            },
            type: 'damage'
          })
          res.send(data)
        } catch (error) {
          res.send(error)
        }
      } else if (type === 'invoices') {
        try {
          const data = await Sale.find({
            createdAt: {
              $gte: new Date(date),
              $lt: new Date(date + 'T23:59:59.999Z')
            }
          });
          res.send(data)
        } catch (error) {
          res.send(error)
        }
      }
    }
  )
)


const getLast12Months = () => {
  const endDate = new Date(); // Today
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12); // 12 months ago
  return { startDate, endDate };
};



///visualize line graph sales, damages, vat & purchase

TransactionRouter.get(
  '/visualize',
  expressAsyncHandler(async (req, res) => {
    try {
      // Get startDate and endDate from query params, or default to past 12 months
      let { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getLast12Months();
        startDate = defaultStartDate.toISOString();
        endDate = defaultEndDate.toISOString();
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Perform aggregations
      const [transactionResults, salesResults] = await Promise.all([
        // Transactions aggregation (purchases, damages, returns)
        Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lt: end },
              type: { $in: ['purchase', 'damage', 'returned'] }
            }
          },
          {
            $project: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              quantity: 1,
              type: 1
            }
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' },
              totalPurchase: {
                $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] }
              },
              totalDamage: {
                $sum: { $cond: [{ $eq: ['$type', 'damage'] }, '$quantity', 0] }
              },
              totalReturned: {
                $sum: { $cond: [{ $eq: ['$type', 'returned'] }, '$quantity', 0] }
              }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        Sale.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lt: end }
            }
          },
          {
            $project: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              itemsTotal: 1,  // Using the pre-calculated field
              total: 1,       // The monetary total
              vat: 1
            }
          },
          {
            $group: {
              _id: { year: '$year', month: '$month' },
              totalSaleQuantity: { $sum: '$itemsTotal' }, // Sum of quantities
              totalSaleAmount: { $sum: '$total' },        // Sum of monetary values
              totalVAT: { $sum: '$vat' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);

      // Merge results (updated to include both quantity and amount)
      const mergedResults = mergeResults(transactionResults, salesResults);

      // Format response
      const formattedData = [
        ['Year-Month', 'Purchase', 'Sale Quantity', 'Sale Amount', 'Damage', 'Returned', 'VAT'],
        ...mergedResults.map(item => [
          `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          item.totalPurchase || 0,
          item.totalSaleQuantity || 0,  // Quantity from itemsTotal
          item.totalSaleAmount || 0,    // Monetary total
          item.totalDamage || 0,
          item.totalReturned || 0,
          item.totalVAT || 0
        ])
      ];

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  })
);




//visualise a bar graph for the loss difference among purchase sale and damages with a trajectory
TransactionRouter.get(
  '/visualize-loss',
  expressAsyncHandler(async (req, res) => {
    try {
      // Date handling
      let { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        const { startDate: defaultStartDate, endDate: defaultEndDate } = getLast12Months();
        startDate = defaultStartDate.toISOString();
        endDate = defaultEndDate.toISOString();
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Get all needed data in parallel
      const [purchases, sales, damages] = await Promise.all([
        // Purchases (total quantity and amount)
        Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lt: end },
              type: 'purchase'
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' },
              totalAmount: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } }
            }
          }
        ]),

        // Sales (using itemsTotal and total from Sale model)
        Sale.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lt: end }
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$itemsTotal' },
              totalAmount: { $sum: '$total' }
            }
          }
        ]),

        // Damages
        Transaction.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lt: end },
              type: 'damage'
            }
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: '$quantity' },
              totalAmount: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } }
            }
          }
        ])
      ]);

      // Extract values (handle empty results)
      const purchaseQty = purchases[0]?.totalQuantity || 0;
      const purchaseAmt = purchases[0]?.totalAmount || 0;
      const saleQty = sales[0]?.totalQuantity || 0;
      const saleAmt = sales[0]?.totalAmount || 0;
      const damageQty = damages[0]?.totalQuantity || 0;
      const damageAmt = damages[0]?.totalAmount || 0;

      // Calculate losses
      const lostQty = purchaseQty - saleQty - damageQty;
      const lostAmt = purchaseAmt - saleAmt - damageAmt;

      // Prepare response for bar graph
      const barData = [
        ['Category', 'Quantity', 'Amount'],
        ['Purchases', purchaseQty, purchaseAmt],
        ['Sales', saleQty, saleAmt],
        ['Damages', damageQty, damageAmt],
        ['Lost', lostQty, lostAmt]
      ];

      // Get monthly trajectory data
      const monthlyData = await getMonthlyTrajectory(start, end);

      res.json({
        barGraph: barData,
        trajectory: monthlyData
      });

    } catch (error) {
      console.error('Error in loss visualization:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  })
);

// Helper to get monthly trajectory
async function getMonthlyTrajectory(start, end) {
  const results = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
          type: { $in: ['purchase', 'damage'] }
        }
      },
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          quantity: 1,
          amount: {
            $cond: [
              { $eq: ['$type', 'purchase'] },
              { $multiply: ['$quantity', '$purchasePrice'] },
              { $multiply: ['$quantity', -1, '$purchasePrice'] } // Damages as negative
            ]
          },
          type: 1
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          purchaseQty: {
            $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$quantity', 0] }
          },
          purchaseAmt: {
            $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$amount', 0] }
          },
          damageAmt: {
            $sum: { $cond: [{ $eq: ['$type', 'damage'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          quantity: '$itemsTotal',
          amount: '$total'
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          saleQty: { $sum: '$quantity' },
          saleAmt: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  const [purchasesData, salesData] = results;

  // Merge monthly data
  const monthlyMap = new Map();

  purchasesData.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    monthlyMap.set(key, {
      year: item._id.year,
      month: item._id.month,
      purchaseQty: item.purchaseQty,
      purchaseAmt: item.purchaseAmt,
      damageAmt: item.damageAmt,
      saleQty: 0,
      saleAmt: 0
    });
  });

  salesData.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthlyMap.has(key)) {
      const existing = monthlyMap.get(key);
      existing.saleQty = item.saleQty;
      existing.saleAmt = item.saleAmt;
    } else {
      monthlyMap.set(key, {
        year: item._id.year,
        month: item._id.month,
        purchaseQty: 0,
        purchaseAmt: 0,
        damageAmt: 0,
        saleQty: item.saleQty,
        saleAmt: item.saleAmt
      });
    }
  });

  // Calculate trajectory points
  const trajectoryData = Array.from(monthlyMap.values())
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(item => {
      const lossAmt = item.purchaseAmt - item.saleAmt - item.damageAmt;
      return {
        date: `${item.year}-${item.month.toString().padStart(2, '0')}`,
        purchaseAmount: item.purchaseAmt,
        saleAmount: item.saleAmt,
        damageAmount: item.damageAmt,
        lossAmount: lossAmt
      };
    });

  return trajectoryData;
}

// Updated merge function
function mergeResults(transactions, sales) {
  const resultMap = new Map();

  transactions.forEach(t => {
    const key = `${t._id.year}-${t._id.month}`;
    resultMap.set(key, {
      _id: t._id,
      totalPurchase: t.totalPurchase,
      totalDamage: t.totalDamage,
      totalReturned: t.totalReturned,
      totalSaleQuantity: 0,
      totalSaleAmount: 0,
      totalVAT: 0
    });
  });

  sales.forEach(s => {
    const key = `${s._id.year}-${s._id.month}`;
    if (resultMap.has(key)) {
      const existing = resultMap.get(key);
      //existing.totalSaleQuantity = s.totalSaleQuantity;
      existing.totalSaleAmount = s.totalSaleAmount;
      existing.totalVAT = s.totalVAT;
    } else {
      resultMap.set(key, {
        _id: s._id,
        totalPurchase: 0,
        //totalSaleQuantity: s.totalSaleQuantity,
        totalSaleAmount: s.totalSaleAmount,
        totalDamage: 0,
        totalReturned: 0,
        totalVAT: s.totalVAT
      });
    }
  });

  return Array.from(resultMap.values()).sort((a, b) =>
    a._id.year - b._id.year || a._id.month - b._id.month
  );
}

TransactionRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const { startDate, endDate, limit, deliveryNote } = req.query
    let query = {}
    try {

      if (deliveryNote) {
        query.deliveryNote = deliveryNote;
      }

      if (startDate || endDate) {
        query.createdAt = {}
        if (startDate) {
          query.createdAt.$gte = new Date(startDate)
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999) ///full day hours and micro secs
          query.createdAt.$lte = end
        }
      }

      const purchases = await Purchase.aggregate([
        { $match: query },
        {
          $facet: {
            purchases: [
              //{$match: {deliveryNote: deliveryNote}},
              { $sort: { createdAt: -1 } },
              { $limit: parseInt(limit) || 50 }
            ],
            totalCount: [{ $count: 'count' }],
            totalValue: [
              {
                $group: {
                  _id: null,
                  total: { $sum: { $ifNull: ['$total', 0] } }
                }
              }
            ],
          }
        }
      ])
      res.send(purchases)

    } catch (error) {
      res.send(error)
    }
  })
)


export default TransactionRouter

