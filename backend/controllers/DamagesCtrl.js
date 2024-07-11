const asyncHandler = require('express-async-handler');
const {Product, Transaction} = require('../models/product');


const recordDamages = asyncHandler(async(req, res)=> {
  try{
      const {selectedProducts, display} = req.body

      for(const selectedProduct of selectedProducts){
         // const{product, purchase} = item

          const newProduct = await Product.findById(selectedProduct.product)

          //CHECK AVAILABILITY
          if (!newProduct) {
              return res.status(404).json({ error: "Product not found" });
          }

          ///UPDATE STOCK QUANTITIES
          if(selectedProduct.quantity > newProduct.inStock || selectedProduct.quantity > newProduct.closingStock){
            res.status(400).send({message: 'Insufficient stock'})
            return
          }
          newProduct.waste += parseInt(selectedProduct.quantity)
          newProduct.inStock -= parseInt(selectedProduct.quantity);
          newProduct.closingStock -= parseInt(selectedProduct.quantity);

          //newProduct.wasteHistory.push({ date: new Date(), quantity: selectedProduct.quantity });

          await newProduct.save()

          ///CREATE TRANSACTION

          const transaction = new Transaction({
              product: selectedProduct.product,
              productName: newProduct.name,
              purchasePrice: newProduct.purchasePrice,
              type: display ? 'display' : 'damage',
              quantity: parseInt(selectedProduct.quantity)
          })

          await transaction.save()
      }
      res.status(200).send({ message: "Bulk record succeded"});
  }catch(error){
      console.log(error)
      res.send(error)
  }
})



module.exports = recordDamages