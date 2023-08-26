const Damaged = require('../models/Damages')
const asycHandler = require('express-async-handler');
const Product = require('../models/product');

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


const PAGE_SIZE = 20
async function getProductsAndDamageCount(req, res) {
  const page = parseInt(req.query.page) || 1
  const startIndex = (page - 1) * PAGE_SIZE

  const result = await Damaged.aggregate([
    {
      $lookup: {
        from: 'products', // Collection name for Product model
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $project: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        product: {
          _id: '$product',
          name: { $arrayElemAt: ['$productInfo.name', 0] }
        },
        totalDamaged: { $cond: ['$isDamaged', '$quantity', 0] },
        totalDisplay: { $cond: ['$isDisplay', '$quantity', 0] }
      }
    },
    {
      $group: {
        _id: {
          year: '$year',
          month: '$month',
          day: '$day',
          product: '$product'
        },
        totalDamaged: { $sum: '$totalDamaged' },
        totalDisplay: { $sum: '$totalDisplay' }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day'
        },
        products: {
          $push: {
            product: '$_id.product',
            totalDamaged: '$totalDamaged',
            totalDisplay: '$totalDisplay'
          }
        },
        totalDayDamaged: { $sum: '$totalDamaged' },
        totalDayDisplay: { $sum: '$totalDisplay' }
      }
    },
    {
      $group: {
        _id: {
          year: '$_id.year',
          month: '$_id.month'
        },
        days: {
          $push: {
            day: '$_id.day',
            products: '$products',
            totalDayDamaged: '$totalDayDamaged',
            totalDayDisplay: '$totalDayDisplay'
          }
        },
        totalMonthDamaged: { $sum: '$totalDayDamaged' },
        totalMonthDisplay: { $sum: '$totalDayDisplay' }
      }
    },
    {
      $group: {
        _id: null,
        months: {
          $push: {
            month: '$_id.month',
            days: '$days',
            totalMonthDamaged: '$totalMonthDamaged',
            totalMonthDisplay: '$totalMonthDisplay'
          }
        },
        totalYearDamaged: { $sum: '$totalMonthDamaged' },
        totalYearDisplay: { $sum: '$totalMonthDisplay' }
      }
    },
    {
      $project: {
        _id: 0,
        months: 1,
        totalYearDamaged: 1,
        totalYearDisplay: 1
      }
    }
  ]).skip(startIndex).limit(PAGE_SIZE).exec();
  const totalCount = result.length
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  res.send({result, totalPages})
 // console.log(result);
}

module.exports = {newData, getProductsAndDamageCount}