const Damaged = require('../models/Damages')
const asycHandler = require('express-async-handler');
const Product = require('../models/product');
const MonthlyDamages = require('../models/MonthlyReports')
const AnnualDamages = require('../models/AnnualReports');


const newData = asycHandler(async(req, res)=> {
    const {product, isDamaged, isDisplay, totalPrice, quantity, photos} = req.body

    /* if (!product || !quantity || !photos || !Array.isArray(photos) || photos.length === 0) {
        res.status(400).json({ message: 'Invalid data provided' });
        return
    } */
  try{
    const UpdatedProduct = await Product.findById(product)
    UpdatedProduct.inStock -= quantity
    await UpdatedProduct.save()


    const newDamages = new Damaged({
        product: product,
        isDamaged: isDamaged,
        isDisplay: isDisplay,
        quantity: quantity,
        totalPrice: totalPrice,
        photos: photos,
    })
    await newDamages.save()
    res.send('Damages recorded successfully')
  }catch(error){
    res.send(error)
  }
})

const getProductsAndDamageCount = asycHandler(async(req, res)=> {
    try{
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() +1;

        //AGGREGATION PIPELINE FOR MONTHLY DATA REPORT
        const monthlyDamagesData = Product.aggregate([
            {
                $lookup: {
                    from: 'damaged',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'damagedCount'
                },
            },
            {
                $addFields: {
                    damagedCount: {
                        $size: {
                            $filter: {
                                input: '$damagedCount',
                                as: 'damaged',
                                cond: {$eq: ['$$damaged.isDamaged', true]}
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    product: '$name',
                    damagedCount: 1,
                    month
                },
            },
             {
                $merge: {
                    into: 'monthlyDamages',
                    whenMatched: 'replace',
                    whenNotMatched: 'insert' 
                }
            }
             
        ]).exec()
//       res.status(200).send(products)


        //MONGO MONTHLY DAMAGES AGGREGATION PIPELINE
        const AnnualdamagesData = await MonthlyDamages.aggregate([
            {
                $group: {
                    _id: {product: '$product', year: '$year'},
                    totalDamagedCount: { $sum: '$damagedCount'}
                }
            },
            {
                $project:{
                    _id: 0, 
                    product: '$_id.product',
                    totalDamagedCount: 1,
                    year: '$_id.year',
                    totalDamagedCount: 1
                }
            },
            {
                $merge: {
                    into: 'annualdamages',
                    whenMatched: 'replace',
                    whenNotMatched: 'insert'
                }
            }
        ]).exec()

        res.status(200).send({monthlyDamagesData, AnnualdamagesData})
    } catch(error){
        console.error(error)
    }
})



module.exports = {newData, getProductsAndDamageCount}