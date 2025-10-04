import { Router } from "express";
import { Expense_Acc, Expense } from "../models/expense.js";
import asyncHandler from 'express-async-handler'
import fs from 'fs'
import path from "path";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

const expenseRouter = Router()


class Expenses {
    constructor(accountId, expense, employee) {
        this.accountId = accountId
        this.expense = expense
        this.employee = employee
    }

    async createAccount(data) {
        const Acc = new Expense_Acc(data)
        await Acc.save()
        return Acc
    };

    async createExpense(data) {
        const newExpense = new Expense(data)
        await newExpense.save()
        return newExpense
    }

    async editExpense(expenseId, updates) {
        const expense = await Expense.findById(expenseId)
        if (!expense) {
            throw new Error({})
        }
        Object.assign(expense, updates)
        await expense.save()
        return expense
    }

    async switchStatus(expenseId, status) {
        const expense = await Expense.findById(expenseId)
        if (!expense) throw new Error({ message: "expense not found", error })
        expense.status = status
        expense.save()
        return expense
    }

    async getExpenses({ startDate, endDate }) {
        const dbQuery = {};

        if (startDate && endDate) {
            dbQuery.submittedOn = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else {
            const today = new Date();
            dbQuery.submittedOn = { $gte: new Date(today.setHours(0, 0, 0, 0)), $lte: new Date(today.setHours(23, 59, 59, 999)) };
        }

        return Expense.find(dbQuery).populate('account', 'name');
    }



    async getBill(expId) {
        const expense = await Expense.findById(expId).select('billFile')

        if (!expense || !expense.billFile) {
            return res.status(404).send('Expense or file path not found');
        }

        const filePath = path.resolve(expense.billFile);

        // Check if the file exists
        await fs.promises.access(filePath, fs.constants.F_OK);

        return filePath
    }



    async getSummary(query) {
        const { account, startDate, endDate, type } = query;

        // Build the initial query filter
        let dbQuery = {};

        if (account) dbQuery.account = account;
        if (startDate && endDate) {
            // Use provided date range
            dbQuery.submittedOn = {
                $gte: new Date(startDate), // Start date
                $lte: new Date(endDate), // End date
            };
        } else {
            // Default to the current month if no date range provided
            const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
            dbQuery.submittedOn = {
                $gte: startOfMonth,
                $lte: endOfMonth,
            };
        }

        const types = ['Utilities', 'Supplies', 'Personal', 'Maintainance', 'Others']; // Available types

        // **PieChart Data**: Aggregating by account name
        const accountsSummary = await Expense.aggregate([
            { $match: dbQuery }, // Apply date range and account filters
            {
                $group: {
                    _id: "$account", // Group by account ID
                    totalAmount: { $sum: "$amount" }, // Sum the amounts for this account
                }
            },
            {
                $lookup: {
                    from: "expense_accs", // The collection name for Expense_Acc
                    localField: "_id", // Match the account ID from Expense to the account collection
                    foreignField: "_id", // Match with the _id in Expense_Acc collection
                    as: "accountDetails",
                }
            },
            { $unwind: "$accountDetails" }, // Flatten the accountDetails array
            // Match expense accounts by type if available in the list
            {
                $match: {
                    "accountDetails.type": { $in: types } // Ensure the account type is one of the available types
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id
                    account: "$accountDetails.name", // Get the account name
                    totalAmount: 1, // Include the totalAmount field
                }
            }
        ]);

        // **ColumnChart Data**: Aggregating by account type
        const accountsByTypeSummary = await Expense.aggregate([
            { $match: dbQuery }, // Apply date range and account filters
            {
                $group: {
                    _id: "$account", // Group by account ID
                    totalAmount: { $sum: "$amount" }, // Sum the amounts for this account
                }
            },
            {
                $lookup: {
                    from: "expense_accs", // The collection name for Expense_Acc
                    localField: "_id", // Match the account ID from Expense to the account collection
                    foreignField: "_id", // Match with the _id in Expense_Acc collection
                    as: "accountDetails",
                }
            },
            { $unwind: "$accountDetails" }, // Flatten the accountDetails array
            {
                $group: {
                    _id: "$accountDetails.type", // Group by account type (e.g., Utilities, Supplies)
                    totalAmount: { $sum: "$totalAmount" }, // Sum the amounts for each account type
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id
                    type: "$_id", // Account type (e.g., "Utilities")
                    totalAmount: 1, // Total amount for this account type
                }
            }
        ]);

        // Prepare the PieData (grouped by account name)
        const PieData = [
            ['Account', 'Total Amount'],
            ...accountsSummary.map(acc => [acc.account, acc.totalAmount]) // Ensure totalAmount is a number
        ];

        // Prepare ColumnData (grouped by account type)
        const ColumnData = [
            ['Account Type', 'Total Amount'],
            ...accountsByTypeSummary.map(acc => [acc.type, acc.totalAmount]) // Ensure totalAmount is a number
        ];

        // Return the data for both charts
        return {
            PieData,
            ColumnData
        };
    }


    async printReport(data){
        const {expenses} = data
        try{
            const totalAmount = await expenses?.reduce((sum, expenses) => sum + expenses.amount, 0);
            const __dirname = path.dirname(fileURLToPath(import.meta.url));

            console.log(expenses, totalAmount)

            //const templateSource = fs.readFileSync('../templates/expenseReport.hbs', 'utf-8')
            const templateSource = fs.readFileSync(path.join(__dirname, '../templates', 'expenseReport.hbs'), 'utf-8');
            const template = Handlebars.compile(templateSource)
            const htmlContent = template({expenses, totalAmount})

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
            const page = await browser.newPage()
            await page.setContent(htmlContent)
            const PDFBUFFER = await page.pdf({
                path: 'expenseReport.pdf', format:"A4",
                printBackground: true
            })
            await browser.close()
            return PDFBUFFER
        }catch(error){
            console.log(error)
        }
        
    }

}

const expenses = new Expenses()

expenseRouter.post('/new-account', asyncHandler(async (req, res) => {
    const expense = await expenses.createAccount(req.body)
    res.send(expense)
}))
expenseRouter.post('/new-expense', asyncHandler(async (req, res) => {
    const expense = await expenses.createExpense(req.body)
    res.send(expense)
}))
expenseRouter.put('/edit-expense/:id', asyncHandler(async (req, res) => {
    const expense = await expenses.editExpense(req.params.id, req.body)
    res.send(expense)
}))
expenseRouter.patch('/expense-status/:id', asyncHandler(async (req, res) => {
    const { status } = req.body
    const expense = await expenses.switchStatus(req.params.id, status)
    res.send(expense)
}))

expenseRouter.get('/accounts', asyncHandler(async (req, res) => {
    const exp_Accs = await Expense_Acc.find({}).select('name')
    res.send(exp_Accs)
}))
expenseRouter.get('/', asyncHandler(async (req, res) => {
    const dbExpenses = await expenses.getExpenses(req.query)
    res.send(dbExpenses)
}))
expenseRouter.get('/summary', asyncHandler(async (req, res) => {
    const dbExpenses = await expenses.getSummary(req.query)
    res.send(dbExpenses)
}))
expenseRouter.get('/bill/:id', asyncHandler(async (req, res) => {
    const billFile = await expenses.getBill(req.params.id)
    res.sendFile(billFile, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            return res.status(500).send('Error sending the file');
        }
    })

}))


expenseRouter.post('/print-report', asyncHandler(async(req, res)=> {

    const report = await expenses.printReport(req.body)
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=expenseReport.pdf',
        'Content-Length': report.length
    });
    res.send(report);
}))


export default expenseRouter