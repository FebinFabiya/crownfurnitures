const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    
    productname:String,
    price:Number,
    discount:Number,
    amount:Number,
    Image:String
     
})
const Product =mongoose.model('product',productSchema)
module.exports=Product