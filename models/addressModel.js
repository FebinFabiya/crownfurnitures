const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const addressSchema = new Schema({
    
   
    delivery_address:[{
        name:String,
        phonenumber:String,
        email:String,
        housename:String,
        pincode:Number,
        area:String,
        city:String,
        state_region:String,
        country:String
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
     
})
const addressModel =mongoose.model('addressModel',addressSchema)
module.exports=addressModel