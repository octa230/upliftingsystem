const express = require('express')
const {newData, getProductsAndDamageCount} = require('../controllers/DamagesCtrl')

const damagesRouter = express.Router()

damagesRouter.post('/new', newData)
damagesRouter.get('/stats', getProductsAndDamageCount)


module.exports = damagesRouter