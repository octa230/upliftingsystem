import mongoose from 'mongoose';

// ── Daily Report Snapshot ─────────────────────────────────────────────────────
const DailyReportSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },

  sales: {
    totalRevenue:  { type: Number, default: 0 },
    totalSubtotal: { type: Number, default: 0 },
    totalVat:      { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    invoiceCount:  { type: Number, default: 0 },
    itemsSold:     { type: Number, default: 0 },
    freeSales:     { type: Number, default: 0 },
    byPaymentMethod: [{ method: String, total: Number }],
    byService:       [{ service: String, total: Number }]
  },

  damages: {
    totalDamageValue:  { type: Number, default: 0 },
    totalItemsDamaged: { type: Number, default: 0 },
    breakdown: [{
      productName:   String,
      quantity:      Number,
      purchasePrice: Number,
      value:         Number
    }]
  },

  purchases: {
    totalSpent: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    byDeliveryNote: [{
      supplier:      String,
      totalSpent:    Number,
      totalItems:    Number,
      breakdown: [{
        productName:   String,
        quantity:      Number,
        purchasePrice: Number,
        identifier:    String
      }]
    }]
  },

  summary: {
    revenue:      { type: Number, default: 0 },
    spent:        { type: Number, default: 0 },
    lostToDamage: { type: Number, default: 0 },
    net:          { type: Number, default: 0 }
  }
}, { timestamps: true });


// ── Closing Stock Snapshot ────────────────────────────────────────────────────
const ClosingStockSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },

  items: [{
    product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:         { type: String },
    code:         { type: String },
    identifier:   { type: String },
    openingStock: { type: Number, default: 0 },
    closingStock: { type: Number, default: 0 },
    inStock:      { type: Number, default: 0 },
    sold:         { type: Number, default: 0 },
    waste:        { type: Number, default: 0 },
    purchase:     { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 }
  }],

  totalProducts:    { type: Number, default: 0 },
  totalStockValue:  { type: Number, default: 0 }  // sum of closingStock * purchasePrice
}, { timestamps: true });


export const DailyReport   = mongoose.models.DailyReport   || mongoose.model('DailyReport',   DailyReportSchema);
export const ClosingStock  = mongoose.models.ClosingStock  || mongoose.model('ClosingStock',  ClosingStockSchema);