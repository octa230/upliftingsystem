import { Router } from "express";
import asyncHandler from 'express-async-handler'
import Company from "../models/company.js";
import { generateId } from "../Helpers.js";

const settingsRouter = Router()

settingsRouter.post('/company', asyncHandler(async(req, res)=>{
    const company = new Company({...req.body, controlId: await generateId()})
    await company.save()
    res.send(company).status(200)
}))

settingsRouter.get('/company', asyncHandler(async(req, res)=>{
    const company = await Company.findOne({})
    res.send(company).status(200)
}))


export default settingsRouter