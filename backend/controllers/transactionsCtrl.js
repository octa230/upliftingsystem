
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


const queryRecords = asyncHandler(async(req, res)=> {
    const {day, year, month, type} = req.query
    let startDate, endDate

    if(year){ 
        startDate = new Date(year, 0, 1)
        endDate = new Date(year, 11, 31, 23, 59, 59, 999)
    }

    if(month){
        startDate.setMonth(month - 1)
        endDate.setMonth(month - 1)
    }

    if(day){
        startDate.setDate(day)
        endDate.setDate(day)
    }

    const getRecords ={
        createdAt: {
            $gte: startDate || new Date(0),
            $lte: endDate || new Date()
        }
    }

    if(type){
        getRecords.type = type  
    }

    try{
        const data = await Transaction.find(getRecords)

        const totals = {
            purchase: { quantity: 0, valuation: 0 },
            sale: { quantity: 0, valuation: 0 },
            damage: { quantity: 0, valuation: 0 },
            display: { quantity: 0, valuation: 0 },
          };
          

          data.forEach((record)=> {
            const {type, quantity, purchasePrice, sellingPrice} = record;

            if(type === 'purchase' || type === 'damage' || type === 'display'){
            totals[type].quantity += quantity
            totals[type].valuation += purchasePrice * quantity
          }else if(type === 'sale'){
            totals[type].quantity += quantity
            totals[type].valuation += sellingPrice * quantity;
          }
        })
        res.send({data, totals})
        //console.log(totals)
    }catch(error){
        res.send(error)
    }
})

module.exports = {queryRecords, monthlySummary}