const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')


const protectedRoute = asyncHandler(async(req, res, next)=> {
    try{
        const token = req.cookies.token
        if(!token){
            res.status(401)
            throw new Error("unauthorized, please login")
        }

        //verify token

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        //GET USER ID FROM TOKEN

        const user = await User.findById(verified.id).select("-password");

        if(!user){
            res.status(401)
            throw new Error("user not found")
        }

        req.user = user
        next()
    } catch (err){

    }
})

module.exports = protectedRoute