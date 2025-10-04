import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
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
app.use(express.urlencoded({extended: false}))
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
.then(()=> {

        app.listen(process.env.PORT, ()=> {
            console.log(`app running on ${PORT}`)
        })
    
}).catch((err)=> console.log(err))

