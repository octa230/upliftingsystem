const express = require('express')
const {loginUser, createUser} = require('../controllers/userCtrl')

const userRouter = express.Router();

userRouter.post('/register', createUser);
userRouter.post('/login', loginUser)


module.exports = userRouter