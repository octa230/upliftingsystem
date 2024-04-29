const User = require("../models/user");
const bcrypt = require('bcryptjs');
const  {generateToken, isAdmin} = require ("../midleware/authMiddleware");
const asyncHandler = require('express-async-handler')



//create user

const createUser = asyncHandler(async(req, res)=> {
const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password)
})

const user = await newUser.save();
res.send({name: user.name, isAdmin: user.isAdmin, email: user.email, token: generateToken(user)}) 
})


//login

const loginUser = asyncHandler(async(req, res)=> {
    const user = await User.findOne({name: req.body.name})
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user)
            })
            return
        }
    }
    res.status(404).send({message: "invalid email or password"})
})



module.exports = { createUser, loginUser }