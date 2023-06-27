const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const ErrorHandler = require('./midleware/errHandler')
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRouter')
const productRouter = require('./routes/productRouter');
const salesRouter = require('./routes/saleRouter')
const { multipleSaleRoutes } = require('./routes/multipleSaleRouter');
const path = require('path');

const app = express();
dotenv.config()
const PORT = process.env.PORT



//middleware
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())


//routes middleware
app.use('/api/product', productRouter)
app.use('/api/user', userRouter)
app.use('/api/multiple', multipleSaleRoutes)
app.use('/api/wholesale', salesRouter)


//routes

/* app.get('/', asyncHandler(async(req, res)=> {
    res.send('home page')
}))
 */
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

