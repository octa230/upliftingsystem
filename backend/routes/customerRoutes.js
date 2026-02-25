import { Router } from "express";
import asyncHandler from 'express-async-handler'
import Customer from "../models/customer.js";

const customerRouter = Router()

customerRouter.post('/', asyncHandler(async(req, res)=>{
    const customer = await Customer.create(req.body)

    await customer.save()
    res.send(customer)
}))

customerRouter.get('/', asyncHandler(async(req, res)=>{
    const customers = await Customer.find({})
    res.json(customers)
}))

customerRouter.put('/:id', asyncHandler(async(req, res)=>{

    const customer = await Customer.findById(req.params.id)
    if(!customer){
        return res.json({status: 404, message:"customer not found"})
    }

    customer.set(req.body)
    customer.save()

    res.json({ status: 'success', data: customer });
}))

customerRouter.delete('/:id', asyncHandler(async(req, res)=>{
    const customer = await Customer.findById(req.params.id)
    if(!customer){
        return res.json({status: 404, message:"customer not found"})
    }

    await customer.remove()
    res.send({message: 'Deleted Successfully'})
}))


export default customerRouter