const express = require('express')
const {newData, getAll, getDataByDate} = require('../controllers/DamagesCtrl')

const damagesRouter = express.Router()

damagesRouter.post('/new', newData)
damagesRouter.get('/stats', getDataByDate)
damagesRouter.get('/all', getAll)



module.exports = damagesRouter