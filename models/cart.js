// const mongoose=require('mongoose');
// const { required } = require('nodemon/lib/config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    cartItems:[{
        products:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required:true
        },
        quantity:{
            type:Number,
            default:1
    
        },
        
    }]
})




const cartModel=mongoose.model('cartModel',cart)

module.exports=(cartModel);
