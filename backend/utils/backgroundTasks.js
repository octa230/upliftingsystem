import cronJob from 'node-cron';
import { Product } from '../models/product.js';
import { Damages } from '../models/Transactions.js'; // adjust path
import { getDailySummary } from './dailySummary.js';

const resetWasteValues = async () => {
  try {
    const productsToUpdate = await Product.find({
      waste: { $exists: true },
      sold: { $exists: true }
    });

    // Build the items array from current waste values (skip zero waste)
    const items = productsToUpdate
      .filter(p => p.waste > 0)
      .map(p => ({
        product: p._id,
        productName: p.name,
        quantity: p.waste,
        purchasePrice: p.purchasePrice ?? 0
      }));

    // Only save a damage record if there's anything to record
    if (items.length > 0) {
      const total = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
      const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

      await Damages.create({
        date: today,
        Items: items,
        total
      });
    }

    // Now reset
    for (const product of productsToUpdate) {
      if (!product.identifier) product.identifier = 'STEM';
      product.waste = 0;
      product.purchase = 0;
      product.sold = 0;
      await product.save();
    }

    console.log(`Waste reset complete. ${items.length} products snapshotted.`);
  } catch (error) {
    console.log(error, 'failed to reset waste values');
  }
};

const backgroundTasks = {
  start: () => {
    // Nightly reset — midnight
    cronJob.schedule('0 23 * * *', async () => {
      console.log('[CRON] Running nightly reset...');
      try {
        await resetWasteValues();
        await getDailySummary({ save: true });
        console.log('[CRON] Nightly reset complete');
      } catch (err) {
        console.error('[CRON] Nightly reset failed:', err.message);
      }
    });

    // Report snapshot every 5 mins throughout the day
    cronJob.schedule('*/5 * * * *', async () => {
      try {
        await getDailySummary({ save: true });
        //console.log('[CRON] Report snapshot updated:', new Date().toLocaleTimeString());
      } catch (err) {
        console.error('[CRON] Snapshot failed:', err.message);
      }
    });
  }
};

export default backgroundTasks;