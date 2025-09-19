import express from 'express';
import bcrypt from 'bcrypt'
import { Employee } from '../models/Profile.js';
import { generateToken } from '../Helpers.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.post(
    '/register',
    expressAsyncHandler(async(req, res)=> {
        console.log(req.body)
    try {
        const newUser = new Employee({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        })
        
        const user = await newUser.save();
        const token = generateToken(user)
        res.send({
            ...user._doc,
            token: token

        })
    } catch (error) {
        console.log(error)
    }
    })
);
userRouter.post(
    '/login', 
    expressAsyncHandler(async(req, res)=> {
        const user = await Employee.findOne({name: req.body.name})
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
)

userRouter.get('/', expressAsyncHandler(async(req, res)=> {
    const users = await Employee.find({}).select('name')
    res.send(users)
}))

export default userRouter
