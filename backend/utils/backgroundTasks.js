import cronJob from 'node-cron';
import { Product } from '../models/Product.js';



Product.schema.virtual("nextWasteResetTime").get(function () {
    const resetTime = new Date(this.updatedAt || this.createdAt).getTime() + 24 * 60 * 60 * 1000;
    return resetTime;
  });

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
  
  const  backgroundTasks={
    start: ()=> {
      cronJob.schedule('10 0 * * * ', resetWasteValues)
    }
  }

  export default backgroundTasks