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


async function getDataByDate(req, res){
  try {
    const { product, isDamaged, isDisplay, month, day, year } = req.query;
    const query = {};

    // If the product parameter is provided, add it to the query
    if (product) {
      query.product = product;
    }

    if (isDamaged !== undefined) {
      query.isDamaged = isDamaged === 'true'; // Convert to boolean
    }

    // If isDamaged or isDisplay are provided, add them to the query
    if (isDisplay !== undefined) {
      query.isDisplay = isDisplay === 'true'; // Convert to boolean
    }

    // If both month, day, and year are provided, filter by that specific date
    if (month && day && year) {
      const startDate = new Date(Date.UTC(year, month - 1, day));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (month && year) {
      // If only month and year are provided, filter by that month and year
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (year) {
      // If only year is provided, filter by that year
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(startDate);
      endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Find all matching Damaged instances based on the query and populate the 'product' field
    const damages = await Damaged.find(query).populate('product');

    // Calculate the total quantity and total price for all matching instances
    const { totalQuantity, totalPrice } = damages.reduce(
      (acc, damage) => ({
        totalQuantity: acc.totalQuantity + damage.quantity,
        totalPrice: acc.totalPrice + damage.quantity * damage.product.price,
      }),
      { totalQuantity: 0, totalPrice: 0 }
    );

    // Create an array of objects containing quantity, day, month, product name, and total price for each instance
    const quantityByDayAndMonth = damages.map((damage) => ({
      quantity: damage.quantity,
      day: damage.createdAt.getUTCDate(),
      month: damage.createdAt.getUTCMonth() + 1,
      productName: damage.product.name, // Assuming 'name' is the field containing the product name
      totalPrice: damage.quantity * damage.product.price,
    }));

    res.send({ totalQuantity, totalPrice, quantityByDayAndMonth });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
/*   try {
    const { product, isDamaged, isDisplay, month, day, year } = req.query;
    const query = {};

    // If the product parameter is provided, add it to the query
    if (product) {
      query.product = product;
    }

    if (isDamaged !== undefined) {
      query.isDamaged = isDamaged === 'true'; // Convert to boolean
    }

    // If isDamaged or isDisplay are provided, add them to the query
    if (isDisplay !== undefined) {
      query.isDisplay = isDisplay === 'true'; // Convert to boolean
    }

    // If both month, day, and year are provided, filter by that specific date
    if (month && day && year) {
      const startDate = new Date(Date.UTC(year, month - 1, day));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); 
      
      //const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Start of the day
     // const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59)); // End of the day

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (month && year) {
      // If only month and year are provided, filter by that month and year
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (year) {
      // If only year is provided, filter by that year
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(startDate);
      endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Find all matching Damaged instances based on the query
    const damages = await Damaged.find(query);

    // Calculate the total quantity for all matching instances
    const totalQuantity = damages.reduce((acc, damage) => acc + damage.quantity, 0);

    // Create an array of objects containing quantity, day, and month for each instance
    const quantityByDayAndMonth = damages.map((damage) => ({
      quantity: damage.quantity,
      day: damage.createdAt.getUTCDate(),
      month: damage.createdAt.getUTCMonth() + 1,
    }));

    res.send({ totalQuantity, quantityByDayAndMonth });
    //console.log({ totalQuantity, quantityByDayAndMonth });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  } */
}

async function getAll(req, res){
  try{
    const data = await Damaged.find()
    if(data){
      res.send(data)
    }else{
      res.send('couldn\'t retrive data' )
    }
  }catch(error){
    console.log(error)
  }
} 

module.exports = {newData, getProductsAndDamageCount, getDataByDate, getAll}