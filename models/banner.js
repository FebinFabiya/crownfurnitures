const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bannerSchema = new Schema({
    
  img:{
    type:String},

     
},
//{timestamps:true}
)
const Banner =mongoose.model('banner',bannerSchema)
module.exports=Banner