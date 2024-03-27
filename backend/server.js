const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const ErrorHandler = require('./midleware/errHandler')
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter')
const productRouter = require('./routes/productRouter');
const saleDetailsRouter  = require('./routes/saleDetailsRouter');
const path = require('path');
const uploadRouter = require('./controllers/uploadCtrl')
const damagesRouter = require('./routes/DamagesRoutes');
const stockRouter = require('./routes/StockRoutes')
const backgroundTasks = require('./utils/backgroundTasks');
const transactionsRouter = require('./routes/transactionRoutes');

const app = express();
dotenv.config()
backgroundTasks.start()
const PORT = process.env.PORT



//middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json())


//routes middleware
app.use('/api/product', productRouter)
app.use('/api/user', userRouter)
app.use('/api/multiple', saleDetailsRouter)
app.use('/api/damages', damagesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/stock', stockRouter)
app.use('/api/transactions', transactionsRouter)

//errorMiddleware
app.use(ErrorHandler)

/* app.use(express.static(path.join(__dirname, '/../frontend/build')))
app.get('*', (req, res)=>
    res.sendFile(path.join(`${__dirname}, '/../frontend/build/index.html`))
)  */

//serve frontend
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res)=> res.sendFile(
        path.resolve(__dirname, '../', 'frontend', 'build', 'index.html')
    ))
}else {
    app.get('/', (req, res)=> res.send('please set to production mode'))
}
mongoose.connect(process.env.MONGO_URI)
.then(()=> {

        app.listen(process.env.PORT, ()=> {
            console.log(`app running on ${PORT}`)
        })
    
}).catch((err)=> console.log(err))

