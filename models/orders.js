const mongoose=require('mongoose')

const orderDetails=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Register'
    },
     productdt:[{
           
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'
        //   type:Array,
        //   ref:'Products'
        

        }],
    
    // paymentMethod:{
    //     type:String

    // },
    status:{
        type:String
    },
    totalAmount:{
        type:Number,
        default:0
    },
    
       
         name:{
        type:String,
        required:true
    },mobile_no:{
        type:Number,
        required:true  
     },email:{
        type:String,
        required:true
        },
    

    housename:{
        type:String,
        required:true,
    },pincode:{
        type:Number,
        required:true
    },
area:{
    type:String,
},
   city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },country:{
        type:String,
        required:true
    },
     
    
    
    
    OrderPlacedAt:{
        type:Date,
        default:Date.now()
    },
    orderstatus:{
        type:Boolean,
          default:false
    },
    cancel:{
          type:Boolean,
          default:false
    },
    paymentId:{
        type:String
    }

})

const orders=mongoose.model('orders',orderDetails)

module.exports=orders;