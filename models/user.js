const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name:String,
    phone:Number,
    email:String,
    password:String,
    block:{
        
      type:  Boolean,
    default:false}
     
})
const User =mongoose.model('user',userSchema)
module.exports=User