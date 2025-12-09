import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Sale } from './models/Transactions.js';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from './routes/userRouter.js';
import ProductRouter from './routes/ProductRoutes.js';
import backgroundTasks from './utils/backgroundTasks.js';
import TransactionRouter from './routes/transactionRoutes.js';
import { ErrorHandler, UploadRouter } from './Helpers.js';
import SaleRouter from './routes/SaleRoutes.js';
import expenseRouter from './routes/expenseRoutes.js';
import settingsRouter from './routes/settingRoutes.js';
import letterheadRouter from './routes/letterHead.js';

const app = express();
dotenv.config()
backgroundTasks.start()
const PORT = process.env.PORT

const __dirname = path.dirname(fileURLToPath(import.meta.url));


//middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())


//routes middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/product', ProductRouter)
app.use('/api/user', userRouter)
app.use('/api/sale', SaleRouter)
app.use('/api/upload', UploadRouter)
app.use('/api/transactions', TransactionRouter)
app.use('/api/expenses', expenseRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/letter-head', letterheadRouter)

//errorMiddleware
app.use(ErrorHandler)



if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Serve the React app
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production mode'));
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {

    app.listen(process.env.PORT, () => {
      console.log(`app running on ${PORT}`)

      //migrateDates()
    })

  }).catch((err) => console.log(err))


const migrateDates = async () => {
  try {
    console.log('Starting date migration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the native MongoDB collection (bypass Mongoose type conversion)
    const db = mongoose.connection.db;
    const salesCollection = db.collection('sales'); // Adjust collection name if different

    // Find all sales - get raw MongoDB documents
    const sales = await salesCollection.find({}).toArray();
    console.log(`Found ${sales.length} sales to check`);

    // Sample the first few to see what format they're in
    console.log('\nSample dates:');
    sales.slice(0, 5).forEach(sale => {
      console.log(`  ${sale._id}: "${sale.date}" (type: ${typeof sale.date})`);
    });
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const sale of sales) {
      try {
        // Check if date is already a Date object in MongoDB
        if (sale.date instanceof Date) {
          skippedCount++;
          continue;
        }

        // Parse different date formats
        let parsedDate;

        if (typeof sale.date === 'string') {
          const dateStr = sale.date.trim();

          // Handle DD/MM/YYYY format
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [day, month, year] = dateStr.split('/');
            parsedDate = new Date(year, month - 1, day);
          }
          // Handle formats like "Mon Dec 08 2025 04:00:00 GMT+0400"
          else if (dateStr.includes('GMT')) {
            parsedDate = new Date(dateStr);
          }
          // Handle ISO format or other standard formats
          else {
            parsedDate = new Date(dateStr);
          }

          // Validate the parsed date
          if (isNaN(parsedDate.getTime())) {
            const errorMsg = `Invalid date for sale ${sale._id}: "${sale.date}"`;
            console.error(`✗ ${errorMsg}`);
            errors.push(errorMsg);
            errorCount++;
            continue;
          }

          // Update directly in MongoDB
          await salesCollection.updateOne(
            { _id: sale._id },
            { $set: { date: parsedDate } }
          );

          if (successCount % 100 === 0) {
            console.log(`✓ Migrated ${successCount} sales...`);
          }
          successCount++;
        } else {
          skippedCount++;
        }

      } catch (error) {
        const errorMsg = `Error migrating sale ${sale._id}: ${error.message}`;
        console.error(`✗ ${errorMsg}`);
        errors.push(errorMsg);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total sales: ${sales.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Skipped (already Date): ${skippedCount}`);
    console.log('========================\n');

    if (errors.length > 0 && errors.length <= 10) {
      console.log('Errors encountered:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    // Verify migration
    console.log('Verifying migration...');
    const sample = await salesCollection.findOne({});
    console.log(`Sample after migration - date: ${sample.date}, type: ${typeof sample.date}, is Date: ${sample.date instanceof Date}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};