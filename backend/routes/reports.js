import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getDailySummary, saveClosingStockSnapshot } from '../utils/dailySummary.js';
import { DailyReport, ClosingStock } from '../models/ReportSchemas.js';
import Company from '../models/company.js';





const ReportRouter = express.Router();

// GET /api/reports/daily  ?date=2025-02-14  &save=true
ReportRouter.get('/daily', expressAsyncHandler(async (req, res) => {
  const { date, save } = req.query;
  const report = await getDailySummary({
    date: date ? new Date(date) : undefined,
    save: save === 'true'
  });
  res.status(200).json(report);
}));

// GET /api/reports/saved  ?limit=30
ReportRouter.get('/saved', expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const reports = await DailyReport.find({})
    .select('date summary sales.invoiceCount sales.totalRevenue damages.totalDamageValue purchases.totalSpent')
    .sort({ date: -1 })
    .limit(limit);
  res.status(200).json(reports);
}));

// GET /api/reports/saved/:date
ReportRouter.get('/saved/:date', expressAsyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  date.setHours(0, 0, 0, 0);
  const report = await DailyReport.findOne({ date });
  if (!report) return res.status(404).json({ message: 'No saved report for this date' });
  res.status(200).json(report);
}));

// GET /api/reports/closing-stock  ?limit=30
ReportRouter.get('/closing-stock', expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const snapshots = await ClosingStock.find({})
    .select('date totalProducts totalStockValue')
    .sort({ date: -1 })
    .limit(limit);
  res.status(200).json(snapshots);
}));

// GET /api/reports/closing-stock/:date
ReportRouter.get('/closing-stock/:date', expressAsyncHandler(async (req, res) => {
  const date = new Date(req.params.date);
  date.setHours(0, 0, 0, 0);
  const snapshot = await ClosingStock.findOne({ date });
  if (!snapshot) return res.status(404).json({ message: 'No closing stock snapshot for this date' });
  res.status(200).json(snapshot);
}));

// POST /api/reports/closing-stock/snapshot  — manual trigger
ReportRouter.post('/closing-stock/snapshot', expressAsyncHandler(async (req, res) => {
  await saveClosingStockSnapshot(new Date());
  res.status(200).json({ message: 'Closing stock snapshot saved' });
}));

// GET /api/reports/daily/pdf  ?date=2025-02-14
ReportRouter.get('/daily/pdf', expressAsyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = targetDate.getTime() === today.getTime();

  // Try saved report first, fall back to live aggregation
  //let report = await DailyReport.findOne({ date: targetDate }).lean();
  //if (!report) report = await getDailySummary({ date: targetDate });

  let report;
  if (isToday) {
    report = await getDailySummary({ date: targetDate });
  } else {
    report = await DailyReport.findOne({ date: targetDate }).lean();
    if (!report) report = await getDailySummary({ date: targetDate });
  }

  const html = await buildReportHTML(report);

  let browser = null;
  try {
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '60px', left: '20px' }
    });
    await browser.close();
    browser = null;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${targetDate.toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    if (browser) try { await browser.close(); } catch (_) { }
    console.error('PDF generation error:', error.message);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}));

// ── HTML/PDF template ─────────────────────────────────────────────────────────
const fmt = (n) => `AED ${(n ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) => (n ?? 0).toLocaleString('en-AE');

const buildReportHTML = async (report) => {
  const dateLabel = new Date(report.date).toLocaleDateString('en-AE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const net = report.summary?.net ?? 0;
  const company = await Company.findOne({}).lean()

  const paymentRows = (report.sales?.byPaymentMethod ?? [])
    .map(p => `<tr><td>${p.method}</td><td class="num">${fmt(p.total)}</td></tr>`).join('');

  const serviceRows = (report.sales?.byService ?? [])
    .map(s => `<tr><td>${s.service}</td><td class="num">${fmt(s.total)}</td></tr>`).join('');

  const damageRows = (report.damages?.breakdown ?? [])
    .map(d => `<tr><td>${d.productName}</td><td class="num">${num(d.quantity)}</td><td class="num">${fmt(d.value)}</td></tr>`).join('');

  const purchaseRows = (report.purchases?.byDeliveryNote ?? []).flatMap(s =>
    (s.breakdown ?? []).map(b =>
      `<tr><td>${s.deliveryNote ?? '—'}</td><td>${b.productName}</td><td class="num">${num(b.quantity)}</td><td class="num">${fmt(b.purchasePrice)}</td></tr>`
    )
  ).join('');



  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #1a1a1a; }
  .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
  .card { border: 1px solid #e5e5e5; padding: 10px 12px; }
  .card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
  .card .value { font-size: 15px; font-weight: 700; }
  .card.net .value { color: ${net >= 0 ? '#16a34a' : '#dc2626'}; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #888; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-bottom: 8px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; text-align: left; padding: 4px 6px; background: #f9f9f9; border-bottom: 1px solid #e5e5e5; }
  td { padding: 5px 6px; border-bottom: 1px solid #f0f0f0; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total-row td { font-weight: 700; background: #f9f9f9; border-top: 1px solid #e5e5e5; }
  .empty { color: #bbb; font-style: italic; }
  .footer { margin-top: 24px; border-top: 1px solid #e5e5e5; padding-top: 8px; font-size: 9px; color: #aaa; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${company.name}</h1>
    <div style="font-size:10px;color:#888;margin-top:2px">Daily Operations Report</div>
  </div>
  <div style="font-size:11px;color:#666">${dateLabel}</div>
</div>

<div class="summary-grid">
  <div class="card"><div class="label">Revenue</div><div class="value">${fmt(report.summary?.revenue)}</div></div>
  <div class="card"><div class="label">Purchases</div><div class="value">${fmt(report.summary?.spent)}</div></div>
  <div class="card"><div class="label">Damage Loss</div><div class="value">${fmt(report.summary?.lostToDamage)}</div></div>
  <div class="card net"><div class="label">Net</div><div class="value">${fmt(net)}</div></div>
</div>

<div class="section">
  <div class="section-title">Sales &nbsp;·&nbsp; ${num(report.sales?.invoiceCount)} invoices &nbsp;·&nbsp; ${num(report.sales?.itemsSold)} items sold &nbsp;·&nbsp; ${num(report.sales?.freeSales)} complimentary</div>
  <div class="two-col">
    <table>
      <thead><tr><th>Payment Method</th><th class="num">Total</th></tr></thead>
      <tbody>
        ${paymentRows || `<tr><td colspan="2" class="empty">No data</td></tr>`}
        <tr class="total-row"><td>Gross Revenue</td><td class="num">${fmt(report.sales?.totalRevenue)}</td></tr>
      </tbody>
    </table>
    <table>
      <thead><tr><th>Service Type</th><th class="num">Total</th></tr></thead>
      <tbody>
        ${serviceRows || `<tr><td colspan="2" class="empty">No data</td></tr>`}
        <tr class="total-row"><td>VAT Collected</td><td class="num">${fmt(report.sales?.totalVat)}</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="section">
  <div class="section-title">Damages &nbsp;·&nbsp; ${num(report.damages?.totalItemsDamaged)} items lost</div>
  <table>
    <thead><tr><th>Product</th><th class="num">Qty</th><th class="num">Value</th></tr></thead>
    <tbody>
      ${damageRows || `<tr><td colspan="3" class="empty">No damages recorded</td></tr>`}
      <tr class="total-row"><td colspan="2">Total Loss</td><td class="num">${fmt(report.damages?.totalDamageValue)}</td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Purchases &nbsp;·&nbsp; ${num(report.purchases?.totalItems)} items &nbsp;·&nbsp; ${num((report.purchases?.byDeliveryNote ?? []).length)} delivery notes</div>
  <table>
    <thead><tr><th>Delivery Note</th><th>Product</th><th class="num">Qty</th><th class="num">Unit Price</th></tr></thead>
    <tbody>
      ${purchaseRows || `<tr><td colspan="5" class="empty">No purchases recorded</td></tr>`}
      <tr class="total-row"><td colspan="3">Total Spent</td><td class="num">${fmt(report.purchases?.totalSpent)}</td></tr>
    </tbody>
  </table>
</div>

<div class="footer">
  <span>${company.name}&nbsp;·&nbsp; ${company.address} &nbsp;·&nbsp; ${company.email} &nbsp;·&nbsp; ${company.phone}</span>
  <span>Generated ${new Date().toLocaleString('en-AE')}</span>
</div>

</body>
</html>`;
};

export default ReportRouter;