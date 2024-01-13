const cronJob = require('node-cron')
const {Product} = require('../models/product')
const StockRecord = require('../models/StockRecord')


Product.schema.virtual("nextWasteResetTime").get(function () {
    const resetTime = new Date(this.updatedAt || this.createdAt).getTime() + 24 * 60 * 60 * 1000;
    return resetTime;
  });

const getstockSnapShot = async () => {
    try {
      const products = await Product.find({
        $or: [
          { closingStock: { $ne: null }},
          { inStock: { $ne: null }},
          { waste: { $ne: null }},
          { purchase: { $ne: null }},
        ]
      });
  
      // Initialize variables to calculate total values for the stock record
      let totalClosingStock = 0;
      let totalDamages = 0;
      let totalSold = 0;
      const productDetails = [];
  
    for (const pdct of products) {
        
      const waste = pdct.waste || 0;
      const sold = pdct.sold || 0;
      const purchasePrice = pdct.purchasePrice || 0;

      //console.log(`Product: ${pdct.name}, Waste: ${waste}, Sold: ${sold}, Purchase Price: ${purchasePrice}`);

      totalDamages += waste * purchasePrice;
      totalSold += sold * purchasePrice;

      const productTotalValue = pdct.closingStock * purchasePrice;
      // Aggregate total closing stock, damages, and sold
      totalClosingStock += productTotalValue;
  
        // Create a separate object for product details to avoid modifying the original function
        const productDetailObject = {
          productId: pdct._id,
          productName: pdct.name,
          closingStock: pdct.closingStock,
          sold: pdct.sold,
          purchase: pdct.purchase,
          damaged: pdct.waste,
          price: pdct.purchasePrice,
          Total: productTotalValue,
        };
  
        // Push the product details object to the array
        productDetails.push(productDetailObject);
      }
  
      // Create a single stock record for the entire collection with individual product details
      const stockRecord = new StockRecord({
        date: new Date().toISOString(),
        products: productDetails,
        closingStockvalue: totalClosingStock,
        TotalDamagesvalue: totalDamages,
        TotalSoldvalue: totalSold,
      });
  
      // Save the stock record to the database
      await stockRecord.save();
  
      console.log('Stock snapshot recorded successfully.');
    } catch (error) {
      console.error('Error recording stock snapshot:', error.message);
    }
  };

const resetWasteValues = async()=> {
    try{
        const productsToUpdate = await Product.find({waste: { $exists: true}, sold: {$exists: true}})

        for(const product of productsToUpdate){
            product.waste = 0;
            product.purchase = 0;
            product.sold = 0
            await product.save()
        }
    }catch(error){
        console.log(error, 'failed to reset waste values')
    }
  }
  

  const backgroundTasks={
    start: ()=> {
      cronJob.schedule('0 0 * * * ', getstockSnapShot);
      cronJob.schedule('10 0 * * * ', resetWasteValues)
    }
  }

module.exports = backgroundTasks