
const asyncHandler = require('express-async-handler')
const { Transaction} = require('../models/product')



const queryRecords = asyncHandler(async(req, res)=> {
    try {
        const { month, year, productName, type, startDay, endDay } = req.query;
    
        // Build query object based on provided parameters
        const query = {
          ...(month && { createdAt: { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${parseInt(month) + 1}-01`) } }),
          ...(productName && { productName }),
          ...(type && { type }),
          ...(startDay && endDay && { createdAt: { $gte: new Date(`${year}-${month}-${startDay}`), $lt: new Date(`${year}-${month}-${endDay}`) } })
        };
    
        const transactions = await Transaction.find(query);
    
        // Calculate total quantity and total price
        let totalQuantity = 0;
        let totalPrice = 0;
        transactions.forEach(transaction => {
          totalQuantity += transaction.quantity;
          totalPrice += transaction.quantity * transaction.purchasePrice;
        });
    
        const responseData = {
          data: transactions,
          totals: {
            totalQuantity,
            totalPrice
          }
        };
    
        res.send(responseData);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
      }
})

const visualizeTransactions = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const results = [];

        // Loop through each day within the date range
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            let match = {
                createdAt: {
                    $gte: date,
                    $lt: nextDay,
                },
            };

            // If a specific type is passed, add type to the match condition
            if (type) {
                match.type = type;
            }

            const transactions = await Transaction.aggregate([
                {
                    $match: match,
                },
                {
                    $group: {
                        _id: '$type',
                        totalQuantity: { $sum: '$quantity' },
                        totalPrice: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
                    },
                },
            ]);

            // Push the aggregated transactions for the day to the results array
            results.push({ date: date.toISOString().split('T')[0], transactions });
        }

        // Extract unique types from transactions
        const typesSet = new Set();
        results.forEach(({ transactions }) => {
            transactions.forEach(({ _id }) => {
                typesSet.add(_id);
            });
        });
        const types = Array.from(typesSet);

        res.json({ results, types });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

  
module.exports = {queryRecords, visualizeTransactions}