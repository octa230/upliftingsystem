import expressAsyncHandler from 'express-async-handler';
import { Transaction, Product } from '../models/product.js';
import express from 'express';
import { Sale } from '../models/Transactions.js';
import Company from '../models/company.js'
import Handlebars from 'handlebars';
import fs from 'fs'
import puppeteer, { executablePath } from 'puppeteer';
import path from 'path';



const SaleRouter = express.Router()

SaleRouter.post('/print-sale/:id', expressAsyncHandler(async (req, res) => {
  let browser = null;

  try {
    console.log('Fetching sale and company data...');

    // Fetch sale and company data
    const [sale, company] = await Promise.all([
      Sale.findById(req.params.id).lean(),
      Company.findOne().lean()
    ]);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Read and compile template
    const templatePath = path.join(process.cwd(), 'templates', 'Invoice.hbs');

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const htmlContent = template({ company, sale });

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    console.log('Browser launched, creating page...');
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 1600 });

    console.log('Setting content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Generating PDF...');
    // Generate PDF without path option
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    browser = null;

    // Verify buffer is not empty
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${sale.InvoiceCode || sale._id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer, 'binary');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    console.error('Error stack:', error.stack);

    // Close browser if it's still open
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    // Send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate PDF',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}))

SaleRouter.post(
  '/new-sale',
  expressAsyncHandler(async (req, res) => {
    let browser = null;
    try {
      const lastSale = await Sale.findOne({}).sort({ createdAt: -1 });
      const invNumber = parseInt(lastSale.InvoiceCode.match(/\d+/)?.[0] || '0') + 1;
      const itemsTotal = req.body.products.reduce((total, item) => {
        return total + (item.quantity * item.price);
      }, 0);
      
      const newSale = new Sale({
        saleItems: req.body.products.map((x) => ({
          ...x,
          quantity: x.quantity,
          productName: x.name,
          total: Number(x.quantity * x.price).toFixed(2),
          price: x.price,
          arrangement: x.arrangement,
          photo: x.photo,
        })),
        InvoiceCode: `UPLDXB_${invNumber}`,
        total: itemsTotal,
        date: req.body.time,
        ...req.body,
        free: req.body.paidBy === 'F.O.C'
      });

      const sale = (await newSale.save()).toObject();
      const company = await Company.findOne().lean();

      if (!sale || !company) {
        return res.status(404).json({ error: 'Sale or Company not found' });
      }

      const templatePath = path.join(process.cwd(), 'templates', 'Invoice.hbs');
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateSource);
      const htmlContent = template({ company, sale });

      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });

      console.log('Browser launched, creating page...');
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1200, height: 1600 });

      console.log('Setting content...');
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('Generating PDF...');
      // Generate PDF without path option
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      await browser.close();
      browser = null;

      // Verify buffer is not empty
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }

      // Set response headers and send the PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="invoice-${sale.InvoiceCode || sale._id}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF buffer as the response
      res.end(pdfBuffer, 'binary');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      console.error('Error stack:', error.stack);

      // Close browser if it's still open
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }

      // Send error response
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to generate PDF',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }
    }
  })
);

SaleRouter.post(
  '/:id/add-units',
  expressAsyncHandler(
    async (req, res) => {
      const saleId = req.params.id;
      const { selectedProducts, unitName } = req.body;

      if (!saleId) {
        return res.status(404).send('No sale ID provided');
      }

      if (!selectedProducts || selectedProducts.length === 0) {
        return res.status(400).json({ error: 'No products or quantities submitted' });
      }

      try {
        const sale = await Sale.findById(saleId);
        if (!sale) {
          return res.status(404).json({ error: 'Sale not found' });
        }

        for (const selectedProduct of selectedProducts) {
          const quantity = parseInt(selectedProduct.quantity);

          // Fetch required product data for validation and transaction
          const productInfo = await Product.findById(
            selectedProduct.product,
            'inStock closingStock sold price purchasePrice name'
          );

          if (!productInfo) {
            return res.status(404).send(`Product ${selectedProduct.product} not found`);
          }

          if (productInfo.inStock < quantity) {
            return res.status(400).send(`Insufficient stock for product ${productInfo.name}`);
          }

          // Decrease stock using atomic update
          await Product.updateOne(
            { _id: selectedProduct.product },
            {
              $inc: {
                inStock: -quantity,
                closingStock: -quantity,
                sold: quantity
              }
            }
          );

          // Create transaction
          const transaction = new Transaction({
            product: selectedProduct.product,
            productName: productInfo.name,
            purchasePrice: productInfo.purchasePrice,
            sellingPrice: productInfo.price,
            type: 'sale',
            quantity: quantity
          });

          await transaction.save();
        }

        // Add unit to sale
        sale.units.push({
          arrangement: unitName,
          products: selectedProducts.map((x) => ({
            ...x,
            product: x.product,
            productName: x.productName,
            quantity: x.quantity,
          }))
        });

        await sale.save();

        res.status(200).send({ message: 'Data added successfully' });
      } catch (error) {
        console.error('Add units error:', error);
        res.status(500).send({ message: 'Something went wrong' });
      }
    }
  )
);


SaleRouter.patch('/status/:id', expressAsyncHandler(async (req, res) => {
  const { status } = req.body
  const sale = await Sale.findById(req.params.id)
  if (!sale) {
    throw new Error('Sale not found')
  } else {
    const oldStatus = sale.status
    sale.status = status
    const newSale = await sale.save()
    console.log(`sale status changed from ${oldStatus} to ${newSale.status}`)
    res.send(newSale)
  }
}))

SaleRouter.get(
  '/sales-data',
  async (req, res) => {
    const salesData = await Sale.aggregate([
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
  }
)

SaleRouter.get(
  '/for',
  expressAsyncHandler(async (req, res) => {
    const { startDate, endDate, limit } = req.query;
    
    let dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        // Set to start of day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.date.$gte = start;
      }
      if (endDate) {
        // Set to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = end;
      }
    }
    
    try {
      const sales = await Sale.aggregate([
        { $match: dateFilter },
        {
          $facet: {
            sales: [
              { $match: {} },
              { $sort: { date: -1 } },
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
            focSales: [
              { $match: { free: true } },
              {
                $group: {
                  _id: null,
                  total: { $sum: { $ifNull: ['$total', 0] } }
                }
              }
            ],
            paymentTotals: [
              {
                $group: {
                  _id: '$paidBy',
                  total: { $sum: { $ifNull: ['$total', 0] } }
                }
              },
              {
                $project: {
                  _id: 0,
                  paymentMethod: '$_id',
                  total: 1
                }
              }
            ]
          }
        }
      ]);
      
      const totalCount = sales[0].totalCount[0]?.count || 0;
      const totalValue = sales[0].totalValue[0]?.total || 0;
      const focSales = sales[0].focSales[0]?.total || 0;
      const paymentTotals = sales[0].paymentTotals || [];
      
      res.status(200).send({
        sales: sales[0].sales,
        totalCount,
        totalValue,
        focSales,
        paymentTotals
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Unable to get results' });
    }
  })
);

SaleRouter.get(
  '/search',
  expressAsyncHandler(
    async (req, res) => {
      const searchText = req.query.searchText
      const sales = await Sale.aggregate([
        {
          $match: {
            $or: [
              { InvoiceCode: { $regex: searchText, $options: 'i' } },
              { phone: { $regex: searchText, $options: 'i' } }
            ]
          }
        }
      ])
      res.send(sales)
    }
  )
)

SaleRouter.put(
  '/edit/:id',
  expressAsyncHandler(
    async (req, res) => {
      try {
        const sale = await Sale.findById(req.params.id)
        if (sale) {
          sale.date = req.body.date || sale.date,
            sale.service = req.body.service || sale.service,
            sale.paidBy = req.body.paidBy || sale.paidBy
          await sale.save()
        }

        res.send(sale)
      } catch (error) {
        res.send(error)
      }
    }
  )
)

SaleRouter.get(
  '/list',
  expressAsyncHandler(
    async (req, res) => {
      const sales = await Sale.find({}).sort({ createdAt: -1 })
      //.limit(10)  
      res.send(sales)
    }
  )
)

SaleRouter.get(
  '/today-sales',
  expressAsyncHandler(
    async (req, res) => {
      // Get today's date
      const today = new Date();
      // Set the start of the day (midnight)
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      // Set the end of the day (just before midnight)
      const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Retrieve sales data for today
      const sales = await Sale.find({
        createdAt: {
          $gte: dayStart,
          $lt: dayEnd
        }
      });

      res.status(200).send(sales);
    }
  )
)

SaleRouter.get(
  '/get-sale/:id',
  expressAsyncHandler(
    async (req, res) => {
      const saleId = req.params.id
      const sale = await Sale.findById(saleId)
      if (sale) {
        res.send(sale)
      } else {
        res.status(404).send({ message: "sale not found" })
      }
    }
  )
)

SaleRouter.get('/options', expressAsyncHandler(async (req, res) => {
  const options = await Sale.aggregate([
    {
      $facet: {
        phones: [{ $group: { _id: "$phone" } }],
        arrangementsAndProducts: [
          { $unwind: "$saleItems" },
          {
            $group: {
              _id: null,
              arrangements: { $addToSet: "$saleItems.arrangement" },
              products: { $addToSet: "$saleItems.productName" }
            }
          }
        ],
        names: [{ $group: { _id: "$name" } }]
      }
    },
    {
      $project: {
        phones: { $map: { input: "$phones", as: "item", in: "$$item._id" } },
        arrangements: {
          $map: { input: { $arrayElemAt: ["$arrangementsAndProducts.arrangements", 0] }, as: "item", in: { $toLower: "$$item" } }
        },
        products: {
          $map: { input: { $arrayElemAt: ["$arrangementsAndProducts.products", 0] }, as: "item", in: { $toLower: "$$item" } }
        },
        names: {
          $map: { input: "$names", as: "item", in: { $toLower: "$$item._id" } }
        }
      }
    }
  ]);

  res.send({
    phones: options[0].phones,
    names: options[0].names,
    arrangements: options[0].arrangements,
    products: options[0].products
  });
}));



export default SaleRouter