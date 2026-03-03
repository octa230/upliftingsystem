import { Sale, Damages, Purchase } from '../models/Transactions.js';
import { Product } from '../models/product.js';
import { DailyReport, ClosingStock } from '../models/ReportSchemas.js';

/**
 * getDailySummary({ date?: Date, save?: boolean })
 * - date: defaults to today
 * - save: if true, persists report + closing stock snapshot to DB
 */
export const getDailySummary = async ({ date, save = false } = {}) => {
    const target = date ? new Date(date) : new Date();
    target.setHours(0, 0, 0, 0);
    const nextDay = new Date(target);
    nextDay.setDate(target.getDate() + 1);

    const [salesData, damagesData, purchasesData] = await Promise.all([

        // SALES
        Sale.aggregate([
            { $match: { date: { $gte: target, $lt: nextDay } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalSubtotal: { $sum: '$subTotal' },
                    totalVat: { $sum: { $ifNull: ['$vat', 0] } },
                    totalDiscount: { $sum: { $ifNull: ['$discount', 0] } },
                    invoiceCount: { $sum: 1 },
                    itemsSold: { $sum: { $sum: '$saleItems.quantity' } },
                    freeSales: { $sum: { $cond: ['$free', 1, 0] } },
                    byPaymentMethod: { $push: { paidBy: '$paidBy', total: '$total' } },
                    byService: { $push: { service: '$service', total: '$total' } }
                }
            },
            { $project: { _id: 0 } }
        ]),

        // DAMAGES
        Damages.aggregate([
            { $match: { createdAt: { $gte: target, $lt: nextDay } } },
            { $unwind: '$Items' },
            {
                $group: {
                    _id: null,
                    totalDamageValue: { $sum: '$total' },
                    totalItemsDamaged: { $sum: '$Items.quantity' },
                    breakdown: {
                        $push: {
                            productName: '$Items.productName',
                            quantity: '$Items.quantity',
                            purchasePrice: '$Items.purchasePrice',
                            value: { $multiply: ['$Items.quantity', '$Items.purchasePrice'] }
                        }
                    }
                }
            },
            { $project: { _id: 0 } }
        ]),

        // PURCHASES
        Purchase.aggregate([
            { $match: { createdAt: { $gte: target, $lt: nextDay } } },
            { $unwind: '$Items' },
            {
                $group: {
                    _id: '$deliveryNote',
                    total: { $first: '$total' },
                    totalItems: { $sum: '$Items.quantity' },
                    breakdown: {
                        $push: {
                            productName: '$Items.productName',
                            quantity: '$Items.quantity',
                            purchasePrice: '$Items.purchasePrice',
                            identifier: '$Items.identifier',
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$total' },
                    totalItems: { $sum: '$totalItems' },
                    byDeliveryNote: {
                        $push: {
                            deliveryNote: '$_id',
                            totalSpent: '$total',
                            totalItems: '$totalItems',
                            breakdown: '$breakdown'
                        }
                    }
                }
            },
            { $project: { _id: 0 } }
        ])
    ]);

    // Group payment methods & services
    const sales = salesData[0] ?? {
        totalRevenue: 0, totalSubtotal: 0, totalVat: 0,
        totalDiscount: 0, invoiceCount: 0, itemsSold: 0,
        freeSales: 0, byPaymentMethod: [], byService: []
    };

    const pmMap = {};
    for (const { paidBy, total } of sales.byPaymentMethod ?? []) {
        pmMap[paidBy] = (pmMap[paidBy] ?? 0) + total;
    }
    sales.byPaymentMethod = Object.entries(pmMap).map(([method, total]) => ({ method, total }));

    const svcMap = {};
    for (const { service, total } of sales.byService ?? []) {
        svcMap[service] = (svcMap[service] ?? 0) + total;
    }
    sales.byService = Object.entries(svcMap).map(([service, total]) => ({ service, total }));

    const damages = damagesData[0] ?? { totalDamageValue: 0, totalItemsDamaged: 0, breakdown: [] };
    const purchases = purchasesData[0] ?? { totalSpent: 0, totalItems: 0, byDeliveryNote: [] };

    const report = {
        date: target,
        sales,
        damages,
        purchases,
        summary: {
            revenue: sales.totalRevenue,
            spent: purchases.totalSpent,
            lostToDamage: damages.totalDamageValue,
            net: sales.totalRevenue - purchases.totalSpent - damages.totalDamageValue
        }
    };

    if (save) {
        await saveReportSnapshot(report, target);
        await saveClosingStockSnapshot(target);
    }

    return report;
};

// ── Save daily report to DailyReport collection ───────────────────────────────
const saveReportSnapshot = async (report, date) => {
    await DailyReport.findOneAndUpdate(
        { date },
        { $set: report },
        { upsert: true, new: true }
    );
};

// ── Save closing stock snapshot for all products ──────────────────────────────
export const saveClosingStockSnapshot = async (date) => {
    const target = date ?? new Date();
    const products = await Product.find({});

    const items = products.map(p => ({
        product: p._id,
        name: p.name,
        code: p.code,
        identifier: p.identifier,
        openingStock: p.openingStock,
        closingStock: p.closingStock,
        inStock: p.inStock,
        sold: p.sold,
        waste: p.waste,
        purchase: p.purchase,
        purchasePrice: p.purchasePrice
    }));

    const totalStockValue = items.reduce(
        (sum, i) => sum + (i.closingStock * i.purchasePrice), 0
    );

    await ClosingStock.findOneAndUpdate(
        { date: target },
        { $set: { date: target, items, totalProducts: items.length, totalStockValue } },
        { upsert: true, new: true }
    );
};