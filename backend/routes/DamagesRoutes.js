const express = require('express')
const recordDamages = require('../controllers/DamagesCtrl')

const damagesRouter = express.Router()


damagesRouter.post('/bulk-records', recordDamages)



module.exports = damagesRouter