var db = require('../config/connection')
const User = require('../models/user')
var nodeMailer=require('nodemailer')
const Admin= require('../models/admin')
const cartModel=require('../models/cart')

const mongoose = require('mongoose');
require('dotenv').config();
const addressModel=require('../models/addressModel')
const orders=require('../models/orders')


const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
const { reject } = require('bcrypt/promises')
const req = require('express/lib/request')
const Razorpay = require('razorpay');




/************** RazorPay***********************/




var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});





//cart product add
const addToCart=(proId,userId,quantity)=>{
    return new Promise(async(resolve,reject)=>{
        let userdt=await cartModel.findOne({user:userId})
    //    console.log(userdt+"456778888")
        if(userdt){
            // console.log(userdt+"weeeeeee")
            let proExist=userdt.cartItems.findIndex(product=>product.products==proId)
            // console.log(proExist+"999999")
            if(proExist!=-1){
                cartModel.updateOne({'cartItems.products':proId,user:userId},
                {
                    $inc:{'cartItems.$.quantity':1}
                }).then((response )=>{
                    // console.log(response+"/////");
                    resolve()
                })
            }else{

           
            cartModel.updateOne({user:userId},{
                $push:{cartItems:[{products:proId,quantity}]}
            }).then(()=>{
                resolve()
            })
             }

        }else{
            let cartObj={
                user:userId,
                cartItems:[{products:proId,quantity}]
            }
            cartModel(cartObj).save().then((response)=>{
                resolve()
            })
        }
    })
}

const getCartDetails=(userId)=>{
    return new Promise(async(resolve,reject)=>{
    const cartDetails= await cartModel.find({user:userId}).populate('cartItems.products').lean()
    console.log(cartDetails[0],'11111111')
    if(cartDetails[0]!= undefined){
    resolve(cartDetails)
    }else{
        resolve()
    }
    })
  
}

const getCart=(cartId)=>{
    return new Promise(async(resolve,reject)=>{
        const cartValue =await cartModel.findById({_id:cartId}).populate('cartItems.products').lean()
        console.log(66666666666666,'cartValue');
        resolve(cartValue)
    })
}

const getTotal=(userId)=>{
    return new Promise(async(resolve,reject)=>{
        cart=await cartModel.findOne({user:userId})
        console.log(cart);
        let id=mongoose.Types.ObjectId(userId)
        if(cart){
            let pamount=await cartModel.aggregate([
                {
                    $match:{user:id}
                },
                {
                    $unwind:'$cartItems'
                },
                {
                    $unwind:"$cartItems.products"
                },
                {
                    $lookup:{
                   from:"products",
                   localField:"cartItems.products",
                   foreignField:"_id",
                   as:"resultingArray"
                    }
                },
                {
                
                $unwind:"$resultingArray"
            },
            {
                $project:{
                    
                    products:"$resultingArray.price",
                },
            }
           
            // {
            //     $group:{
            //         _id:null,
            //         sum:{$sum:"$resultingArray"}
            //     }
            // }
            
            // ,
            //  {
            //     $project:{
            //       subtotal:1,
            //       shippingCharge:1
            //     }
            //   },
            // {
            //     $group:{
            //         _id:null,
            //         total_am:{$sum:"$subtotal"},
            //          ship:{$sum:"$shippingCharge"}
            //     }
            // },
            //   {
            //      $addFields:{
            //     total: { $sum: ["$total_am", "$ship"] }
            //      }
            //  }
            ])

            console.log('aaaaaaaaaaaamount',pamount);
            const quantity=await cartModel.aggregate([
                {
                    $match:{user:id}
                },
                {
                    $unwind:'$cartItems'
                },
                {
                $project:{
                    
                    quantity:"$cartItems.quantity",
                },
                
            }
        ])
        console.log(quantity,'pppppppppproduct');
        let sum=0
        for (let i = 0; i < pamount.length; i++) {
            let mutpro=quantity[i].quantity*pamount[i].products
            console.log(mutpro);
            sum=sum+mutpro
                      }
                      console.log('good',sum);
                       resolve(sum)

        //     if(totalAmount==null){
        //         resolve({status:true})
        //         console.log(totalAmount+"uuuuu");
        //     }else{
        //         let grandTotal=totalAmount.pop();
                
        //         console.log("%j",grandTotal)
        //       await cartModel.findOneAndUpdate({user:userId},{$set:{total:grandTotal.total,total_a:grandTotal.total_am}})
        //      //    resolve({status:true})
        //       resolve(grandTotal)
        //         console.log("%j",grandTotal);
        //     }
        // } 
        // else{
           
        }else{
            sum=0
            resolve(sum)
        }
    })
}

//change quantity in cart

const changeProductQuantity=async(details)=>{
       
    let count=parseInt(details.count)
     let quantity=parseInt(details.quantity)
    
     
     return new Promise((resolve,reject)=>{
         if(count==-1 && quantity==1){
              
             cartModel.updateOne({'cartItems._id':details.cart},
                 {
                     $pull:{cartItems:{products:details.products}}
                 }).then((response)=>{
                     
                     resolve({removeProduct:true})
                 })  
         }else{
            
                //  let qty=quantity+1;
                //  let subtotal=qty*price;
                 console.log(count);
             cartModel.updateOne({'cartItems._id':details.cart,'cartItems.products':details.products},
             {
                 
                 $inc:{'cartItems.$.quantity':count},
                //  $set:{'cartItems.$.subtotal':subtotal}
             }
             ).then((response)=>{
                 
                resolve({status:true})

             })
             
            //  else{
            //      let qty=quantity-1;
            //      let subtotal=qty*price;
            //        carModel.updateOne({'cartItems._id':details.cart,'cartItems.products':details.products},
            //  {
                 
            //      $inc:{'cartItems.$.quantity':count},
            //      $set:{'cartItems.$.subtotal':subtotal}
            //  }
            //  ).then((response)=>{
                 
            //     resolve({status:true})

            //  })
            //  }
             
         }
            

     })
 }

//  const multipli=(value)=>{
//     return new Promise((resolve,reject)=>{
//     let amount=parseInt(value.amount)
//     let quantity=parseInt(value.quantity)
//     let mutvalue=amount*quantity
//     console.log('multiplication ',mutvalue);
//     resolve({status:true})
//     resolve(mutvalue)
//     })

//  }
module.exports = {
    addToCart,
    getCartDetails,
    changeProductQuantity,
    getTotal,
    // multipli,
    
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)

            const otpGenerator = await Math.floor(1000+Math.random()*9000)
            const newUser = await({
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                password: userData.password,
                otp:otpGenerator
             })
            console.log(newUser);
            if(newUser){
                try {
                    const mailTransporter = nodeMailer.createTransport({
                        host: 'smtp.gmail.com',
                        service: "gmail",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.NODEMAILER_USER,
                                pass: process.env.NODEMAILER_PASS
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
            
                    });
            
                    const mailDetails = {
                        from: "jancyfebin555@gmail.com",
                        to: userData.email,
                        subject: "just testing nodemailer",
                        text: "just random texts ",
                        html: '<p>hi ' + userData.name + 'your otp ' + otpGenerator + ''
                    }
                    mailTransporter.sendMail(mailDetails, (err, Info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("email has been sent ", Info.response);
                        }
                    })
                } catch (error) {
                    console.log(error.message);
                }
            
            }
            resolve(newUser)
            // }
            // await newUser.save().then((data) => {
            //     resolve(data)
            // })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
           let loginStatus=false
            let response={}
            let user=await User.findOne({email:userData.email})
            let admin=await Admin.findOne({email:userData.email})
console.log(admin);
console.log('dfghhg');

            if(user){
                if(user.block){
                   
                    reject({ status: false, msg: "You are blocked" });
                }else{

                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log('Login Success');
                        response.user=user
                        response.status=true
                        resolve(response)
                        console.log(response,"qwerty");
                    }
                    else{
                        console.log('Login Failed');
                        console.log("333333333333");
                        reject({ status: false, msg: "Password not matching!" });
                        // resolve({status:false})
                    }
                })
            }
            }else if(admin){
                if(userData.password==admin.password){
                    console.log('AdminLoginSuccess');
                    response.admin=admin
                        response.status=true
                        resolve(response)
                }else{
                    console.log("login Failed");
                    reject({ status: false, msg: "Password not matching!" });
                    // resolve({status:false})
                }
            }else{
                console.log('Loin Failed Again');
                reject({ status: false, msg: "Email not registered, please sign up!" });
                // resolve({status:false})

            }
        })
    },

    doresetPasswordOtp: (resetData) => {
        return new Promise(async (resolve, reject) => {
          const user = await User.findOne({ email: resetData.email });
          
          console.log(user);
          if (user) {
            // resetData.password = await bcrypt.hash(resetData.password, 10);
    
            const otpGenerator =  Math.floor(1000 + Math.random() * 9000);
            const newUser =  {            
              email: resetData.email,
              otp: otpGenerator,
              _id:user._id
              
            };
            console.log(newUser);
    
            try {
              const mailTransporter = nodeMailer.createTransport({
                host: "smtp.gmail.com",
                service: "gmail",
                port: 465,
                secure: true,
                auth: {
                  user: "jancyfebin555@gmail.com",
                  pass: "jltxtqrycnskxiqz",
                },
                tls: {
                  rejectUnauthorized: false,
                },
              });
    
              const mailDetails = {
                from: "jancyfebin555@gmail.com",
                to: resetData.email,
                subject: "just testing nodemailer",
                text: "just random texts ",
                html: "<p>Hi " + "user, " + "your otp for resetting Crown Furnitures account password is " + otpGenerator+".",
              };
              mailTransporter.sendMail(mailDetails, (err, Info) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("email has been sent ", Info.response);
                }
              });
            } catch (error) {
              console.log(error.message);
            }
    
            resolve(newUser);
    
    
          } else {
            reject({ status: false, msg: "Email not registered, please sign up!" });
          }
        });
      },
      doresetPass: (rData,rid) => {
        console.log(rData);
        return new Promise(async (resolve, reject) => {
          let response = {};
          rData.password = await bcrypt.hash(rData.password, 10);
         
          let userId =rid
          console.log(userId+'12');
          let resetuser = await User.findByIdAndUpdate({_id:userId},
            {$set:{password:rData.password}})
    
         
    resolve(resetuser)
          
      })
    },
    addAddress:(boody,userId)=>{
        return new Promise(async (resolve, reject) => {
            console.log('3333');
            console.log(userId);
            const addrUser=await addressModel.findOne({user:userId})
            console.log('5555555',addrUser);
            if(addrUser){
                console.log('))))');
                addressModel.updateOne({user:userId},{
                    $push:{
                        delivery_address:[{
                            name:boody.username,
                            phonenumber:boody.phonenumber,
                            email:boody.email,
                            housename:boody.house_name,
                            pincode:boody.pincode,
                            area:boody.area,
                            city:boody.city,
                            state_region:boody.state,
                            country:boody.country
                        }]
                    }
                }).then((response)=>{
                    console.log(response);
                    resolve(response)
                })
            }
            else{
                let addressValue={
                    user:userId,
                   
                            delivery_address:[{
                                name:boody.username,
                                phonenumber:boody.phonenumber,
                                email:boody.email,
                                housename:boody.house_name,
                                pincode:boody.pincode,
                                area:boody.area,
                                city:boody.city,
                                state_region:boody.state,
                                country:boody.country
                            }]
                }
                addressModel(addressValue).save().then((response)=>{
                    console.log('88888');
                    console.log(response);
                    resolve(response)
                })
            }
        })

    },
    getAddress:(userId)=>{
return new Promise(async(resolve,reject)=>{
    let getaddress=await addressModel.find({user:userId}).lean()
    console.log('asdfghj',getaddress);
    resolve(getaddress)
})
    },
    getSelectAddress:(addId)=>{
        return new Promise(async(resolve,reject)=>{
            let addid = mongoose.Types.ObjectId(addId)

            let selectedAddress=await addressModel.aggregate([
                {
                    $unwind: "$delivery_address"
                },
                {
                    $match: { 'delivery_address._id': addid }
                },
                // {
                //     $project:{
                    
                //         delivery_address:"$delivery_address",
                //     },
                    
                
                // }
            ])
            console.log('sdgfh',selectedAddress);
            resolve(selectedAddress[0])
        })
    },
    
   getCartProductList : (userId) => {
        return new Promise(async (resolve) => {
            id = mongoose.Types.ObjectId(userId)
            let cart = await cartModel.aggregate([
                {
                    $match: {
                        user: id
                    }
                },
                {
                    $unwind: '$cartItems'
                }, {
                    $project: {
                        _id: '$cartItems.products'
                    }
                }
            ])
    
            resolve(cart)
    
        })
    },
    placeOrder :(address, total, product,user) => {
        return new Promise((resolve) => {
            console.log(address, product, total);
            // let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
    
                name: address.username,
                mobile_no:address.phonenumber,
                email:address.email,
                housename: address.house_name,
                pincode: address.pincode,
                area:address.area,
                city:address.city,
                state: address.state,
                country:address.country,
         
                user: user,
                // paymentMethod: order['payment-method'],
                productdt: product,
                totalAmount: total,
                status: 'pending',
                // orderstatus: 'ordered'
            }
            orders(orderObj).save().then((response) => {
                cartModel.deleteOne({ user: address.user }).then(() => {
    
                    // console.log(response);
                    resolve({ status: true })
                })
    
                resolve(response._id)
            })
        })
    
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err, "RazorPay Error");
                }
    
                resolve(order)
            })
    
        })
    
    },
    verifyPayment : (details) => {
        console.log("details=======",details);
    
        return new Promise(async (resolve, reject) => {
            const {
                createHmac
            } = await import('node:crypto');
    
            let hmac = createHmac('sha256', process.env.RAZORPAY_KEY);
    
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                console.log("verify complete");
                resolve("success")
              
            } else {
                console.log("verify not complete");
                reject(err)
            }
    
        })
    },

    changePaymentStatus: (bookingId, paymentData) => {

        console.log(paymentData, "----paymentDaataaaaaaa");

        return new Promise(async (resolve, reject) => {

            const bookings = await orders.updateMany({ _id: bookingId }, {
                $set: { status: "Orderd", paymentId: paymentData['payment[razorpay_payment_id]'] }


            }).then(() => {
                resolve()
            })
        })

    },
    getUserOrders : (userId) => {
        return new Promise(async (resolve) => {
            let orderdt = await orders.find({ user: userId }).populate('productdt').lean()
    
            resolve(orderdt)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve) => {
           
            const orderproDetails = await orders.find({ _id: orderId }).populate('productdt').lean()
           
            resolve(orderproDetails)
    
    
        })
    
    },
    deletecart:(userId)=>{
        return new Promise(async (resolve) => {
        let booked=await orders.find({user:userId})
        console.log('booked',booked[0].status);
        if(booked[0].status=='Orderd'){
let removeCart=await cartModel.deleteOne({user:userId})
resolve()
        }else{
            resolve()
        }
        })
    },
    cancel: (orderId) => {
        console.log('hiiii',orderId);
        return new Promise(async (resolve, reject) => {
          const order = await orders.findByIdAndUpdate(
            { _id: orderId },
            { $set: { cancel: true } },
            // { upsert: true }
          );
          resolve(order);
        });
      },
      
      cancelled: (orderId) => {
        return new Promise(async (resolve, reject) => {
          const order = await orders.findByIdAndUpdate(
            { _id: orderId },
            { $set: { block: false } },
            // { upsert: true }
          );
          resolve(order);
        });
      }
}