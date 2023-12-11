
const asyncHandler = require('express-async-handler')
const moment = require('moment')
const { Transaction} = require('../models/product')


const monthlySummary = asyncHandler(async(req, res)=> {
    const monthlyTotals = await Transaction.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: moment().startOf("month").toDate(),
                    $lt: moment().endOf("month").toDate()
                }
            }
        },
        {
            $group: {
                _id: '$type',
                totalPurchase: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$type', 'purchase'] },
                            then: { $multiply: ["$purchasePrice", "$quantity"] },
                            else: 0
                        }
                    }
                },
                totalSold: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$type', 'sale'] },
                            then: { $multiply: ["$sellingPrice", "$quantity"] },
                            else: 0
                        }
                    }
                },
                totalDamage: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$type', 'damage'] },
                            then: { $multiply: ["$purchasePrice", "$quantity"] },
                            else: 0
                        }
                    }
                },
                totalDisplay: {
                    $sum: {
                        $cond: {
                            if: { $eq: ['$type', 'display'] },
                            then: { $multiply: ["$purchasePrice", "$quantity"] },
                            else: 0
                        }
                    }
                },
                totalQuantity: { $sum: "$quantity" }
            }
        }
    ]);

    res.send(monthlyTotals);
})


module.exports = monthlySummary