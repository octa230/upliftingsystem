const User = require("../models/user");
const bcrypt = require('bcryptjs');
const {token} = require('../utils/auth')
const asyncHandler = require('express-async-handler')



//create user

const createUser = asyncHandler(async(req, res)=> {
const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password)
})

const user = await newUser.save();
res.send({name: user.name, email: user.email}) 
token(user)
})


//login

const loginUser = asyncHandler(async(req, res)=> {
    const user = await User.findOne({name: req.body.name})
    if(user){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                name: user.name,
                email: user.email,
                token: token(user)
            })
            return
        }
    }
    res.status(404).send({message: "invalid email or password"})
})



module.exports = { createUser, loginUser }