// Using Node.js `require()`
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/crown-furnitures",{
    useNewUrlParser:true
}).then(()=>{
    console.log('connection Successfull')
}).catch((e)=>{
    console.log('No Connection');
})