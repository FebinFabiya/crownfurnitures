var db = require('../config/connection')
const Product =require('../models/product')
const path = require("path");
const User=require('../models/user')
const category=require('../models/category')
const subcategory=require('../models/subcategory')
const orders=require('../models/orders')
const Banner=require('../models/banner')

const multer=require('multer');
const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises');
var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/images")
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"--"+file.originalname)
    }
})
var upload=multer({
    storage:storage
})






module.exports={
    upload,
     addProduct : (productData,file)=>{
         console.log(file,"wrjhwekrfwekl");
        return new Promise(async(resolve,reject)=>{
            console.log(productData);
            const amount=(productData.price)-(productData.discount)
            console.log('after discount amount',amount);
            const newproduct = await new Product({
                productname: productData.productname,
                price: productData.price,
                discount: productData.discount,
                amount:amount,
                Image: file.filename
           
            })
            await newproduct.save().then((data)=>{
                resolve(data)
            })
     
        
            console.log(newproduct);
        })
    },
    getProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await Product.find().lean()
            console.log(product);
            resolve(product)
        }) 
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            const allCategory=await category.find({}).lean()
            resolve(allCategory);
        })
    },
    getAllSubcategory:()=>{
        return new Promise(async(resolve,reject)=>{
            const AllSubcategory=await subcategory.find({}).lean()
            resolve(AllSubcategory);
        })
      },
    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {
          const categoryNames = data.category;
          console.log(categoryNames,'sfasfasfasfas');
          const categoryOld = await category.findOne({ category: categoryNames });
          if (categoryOld) {
            reject({ status: false, msg: "Category already added!" });
          } else {
            const addCategory = await new category({
              category: categoryNames
            });
            await addCategory.save(async (err, result) => {
              if (err) {
                reject({ msg: "Category not added" });
              } else {
                resolve({ result, msg: "Category added" });
              }
            });
          }
        });
      },
      addSubcategory:(data)=>{
        return new Promise(async (resolve, reject) => {
          const subcategoryNames = data.subcategory;
          console.log(subcategoryNames,'sfasfasfasfas');
          const subcategoryOld = await subcategory.findOne({ subcategory: subcategoryNames });
          if (subcategoryOld) {
            reject({ status: false, msg: "Sub-Category already added!" });
          } else {
            const addSubcategory = await new subcategory({
              subcategory: subcategoryNames
            });
            await addSubcategory.save(async (err, result) => {
              if (err) {
                reject({ msg: "Sub-Category not added" });
              } else {
                resolve({ result, msg: "sub_Category added" });
              }
            });
          }
        });
      },
    deleteProduct:(proId)=>{
      console.log('dddddddddddddd');
        return new Promise(async(resolve,reject)=>{
            const result = await Product.deleteOne({ _id: proId}).then((product)=>{
              //  console.log(events);

                resolve(product)
            })
           // console.log(result);

        })

    },
    findProduct:(prodId)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await Product.findById({ _id:prodId }).lean().then((product)=>{
                // console.log('helper',product)
                resolve(product)
            })
          
        })
        
    },
    updateProduct:(proId,proDetails,file)=> {
        console.log(file);
        return new Promise(async(resolve,reject)=>{
            const resultpro = await Product.updateOne({ _id:proId}, {
                $set: {
                    productname: proDetails.productname,
                    price: proDetails.price,
                    discount: proDetails.discount,
                    Image: file,
                }
                }).lean().then((response)=>{
                    resolve()
                })
       
        });
        console.log(resultpro,'updateevent');
    },
    getUser:()=>{
        return new Promise(async(resolve,reject)=>{
         await User.find().lean().then((response)=>{
              resolve(response)
          })
        })  
    },
    blockUser: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
          const user = await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { block: true } },
            { upsert: true }
          );
          resolve(user);
        });
      },
      
      unBlockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
          const user = await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { block: false } },
            { upsert: true }
          );
          resolve(user);
        });
      },
      getOrderList:()=>{
        return new Promise(async (resolve, reject) => {
          const orderL=await orders.find().lean()
          resolve(orderL)
        })
      },
      ordered: (orderId) => {
        console.log('hiiii',orderId);
        return new Promise(async (resolve, reject) => {
          const order = await orders.findByIdAndUpdate(
            { _id: orderId },
            { $set: { orderstatus: true } },
            // { upsert: true }
          );
          resolve(order);
        });
      },
      
      shipped: (orderId) => {
        return new Promise(async (resolve, reject) => {
          const order = await orders.findByIdAndUpdate(
            { _id: orderId },
            { $set: { orderstatus: false} },
            // { upsert: true }
          );
          resolve(order);
        });
      },
    addBanner:(file)=>{
        return new Promise(async(resolve,reject)=>{
             let banner_img=file
            console.log('helperimage',file);
            const bannerImg=await new Banner({
             img:banner_img
            //  description:adminBanner.description
            })
            
            await bannerImg.save().then((data)=>{
              console.log('img',data);
              resolve(data)
          })
        })
    },
  
  getBannerImages:()=>{
      return new Promise(async(resolve,reject)=>{
          const bannerImage=Banner.find().lean()
          resolve(bannerImage)
      })
  
    }
}