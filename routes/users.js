const { response } = require('express');
var express = require('express');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
var router = express.Router();
const userHelper=require('../helpers/user-helper')
const adminHelper =require('../helpers/admin-helper')
const user = require('../models/user')

const verifyLogin=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}



/* GET users listing. */




router.get('/',async function(req, res, next) {
  var productDisplay= await adminHelper.getProduct()
  console.log('hi hello',productDisplay);
  let banner=await adminHelper.getBannerImages()
  console.log('imageeeeeeeee',banner);
  if(req.session.user){
    userValue=req.session.user 
    console.log('/uservalue',userValue); 
    console.log('/user session',req.session.user);
  res.render('index',{productDisplay,userValue,banner});
  }else{
    console.log('indexwithout login');
    res.render('index',{productDisplay,banner});
  }
});



router.get('/login',async function(req, res, next) {
  var productDisplay= await adminHelper.getProduct()
  if(req.session.user){
    console.log(req.session.user,'gyhgvuvhuv');
   // userValue=req.session.user    
    //res.render('user/user_home',{userValue});
     res.redirect('/');
  }else if(req.session.admin){
    res.redirect('/admin')
  }else{
    res.render('login',{layout:false,signupSuccess: req.session.signupSuccess,
      loggErr: req.session.loggedInError,
      signuperror: req.session.loggErr2,
      passwordreset: req.session.message,
      // blockmsg:req.session.blockmsg
    });

      req.session.signupSuccess = null;
      req.session.loggErr2 = null;
      req.session.loggedInError = null;
      req.session.message = null;
      // req.session.blockmsg=null;

  }
});
router.post('/login',(req,res)=>{
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  userHelper.doLogin(req.body).then((response) => {
    if (response.user) {
      req.session.user = response.user
      console.log('login',req.session.user);
      req.session.loggedIn = true
      res.redirect("/login")
      
    }
    else  if (response.admin) {
    req.session.admin = response.admin
      req.session.admin.loggedIn = true
      //res.redirect('/logged')
      res.redirect('/admin')

    }
    else {
      req.session.loginErr = 'invalid email or password'
      res.redirect('/login')

    }
  })
  .catch((err) => {
    req.session.loggedInError = err.msg;
    res.redirect("/login");
    console.log('1111111111111111111');
  });
})

router.get("/forgetPassword", function (req, res, next) {
  res.render("user/forget_password", { layout: false });
});

router.post("/forget", async (req, res) => {
  userHelper
    .doresetPasswordOtp(req.body)
    .then((response) => {
      console.log(response);
      req.session.otp = response.otp;
      req.session.userdetails = response;
      req.session.userRID = response._id;
      // console.log(req.session.userRID+'hhhhh');
      res.redirect("/otpReset");
    })
    .catch((err) => {
      req.session.loggErr2 = err.msg;
      res.redirect("/login");
    });
});

router.get("/otpReset", function (req, res, next) {
  res.render("user/otp_reset", { layout: false, otpErr: req.session.otpError });
});

router.post("/otpResetVerify", async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    res.redirect("/password_reset");
  } else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching!";
    res.redirect("/otpReset");
  }
});

router.get("/password_reset", function (req, res, next) {
  res.render("user/password_reset", {
    layout: false,
    otpErr: req.session.otpError,
    passErr: req.session.passErr,
  });
  req.session.passErr = null;
  req.session.otpError = null;
});

router.post("/RPass", async (req, res) => {
  console.log(req.body);
  if (req.body.password == req.body.confirmPassword) {
    userHelper.doresetPass(req.body, req.session.userRID).then((response) => {
      console.log(response);
      req.session.message =
        "Password changed succesfully! Please login with new password";
      res.redirect("/login");
      console.log("Password updated");
    });
  } else {
    console.log("password mismatch");
    req.session.passErr = "Password mismatch";
    res.redirect("/password_reset");
  }
});


router.get('/signup', function(req, res, next) {
  res.render('signup',{layout:false});
});
router.get('/otp', function(req, res, next) {
  res.render('otp_signup',{layout:false});
});

router.post('/signup', function(req, res, next) {
  userHelper.doSignup(req.body).then((response)=>{
    req.session.otp=response.otp
    req.session.userdetails=response
    res.redirect('/otp')
  }) 
});

router.post('/otpverify',async(req,res)=>{
  if(req.session.otp==req.body.otpsignup){
    let userData=req.session.userdetails
    const adduser=await new user({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password

    })
    await adduser.save()
    req.session.signupSuccess='Signup sucessfull, Please do login to continue'
    res.redirect('/login')
  }
  else{
    res.redirect('/signup')
  }
})

//add to cart action

router.get('/add-tocart/:id',verifyLogin,(req,res,next)=>{
  console.log('api call')
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
    // res.json({status:true})
  })

})

//cart page render

router.get('/cart',verifyLogin,async(req,res,next)=>{
  
  let user=req.session.user
  let cartProducts=await userHelper.getCartDetails(req.session.user._id)
  console.log('hhhhhhhhhh');
  console.log(cartProducts+"345678889")
  const total=await userHelper.getTotal(req.session.user._id)
  req.session.total=total
  
  console.log(total);

  res.render('user/cart',{cartProducts,total,userValue})
})

//Quantity
router.post('/change-product-quantity',(req,res)=>{
  let user=req.session.user
  userHelper.changeProductQuantity(req.body,user).then((response)=>{
    res.json(response)
    
  })

})

//checkout
router.get('/checkout/:id',async(req,res)=>{
  userValue=req.session.user
  req.session.proId=req.params.id
console.log('66666666',req.session.user._id)
  // const cartList=await getCart(req.params.id)
  let getADdress=await userHelper.getAddress(req.session.user._id)
  console.log('xdhg',getADdress);
  // let addrvalue=req.session.addr
  // console.log('value of address',addrvalue);
  total= req.session.total

  res.render('user/checkout',{userValue,getADdress,total})

})


/* addShippingAddress */
router.post('/addShippingAddress',async(req,res)=>{
  console.log('req.body',req.body);
  console.log('pro id',req.session.proId);
  userHelper.addAddress(req.body,req.session.user._id).then((response)=>{
    res.redirect('/checkout/:req.session.proId')
  })
})

/* delivery_address */
router.get('/delivery_address/:id',async(req,res)=>{
let getSelectedAddr=await userHelper.getSelectAddress(req.params.id)
// req.session.addr=getSelectedAddr
console.log('2222222',getSelectedAddr);
userValue=req.session.user
total= req.session.total
console.log('userValue111111',userValue._id);
// let userID=req.session.user._id
res.render('user/checkout_secondpage',{userValue,getSelectedAddr,total})
})

/* Payment */
router.post('/delivery_address',async(req,res)=>{
  let productss=await userHelper.getCartProductList(req.body.userId)

  userHelper.placeOrder(req.body,req.session.total,productss,req.session.user).then((orderId)=>{
    console.log(orderId,'5555555555');
  userHelper.generateRazorpay(orderId,req.session.total).then((response)=>{
    console.log(response,'1234')
   
    res.json(response)
  })
  })
})


router.post('/verify-payment', (req, res) => {
console.log('sdfghjkk',req.body);

  userHelper.verifyPayment(req.body).then((response) => {
   console.log("changePaymentStatus")
    userHelper.changePaymentStatus(req.body['order[receipt]'], req.body).then(() => {

      console.log("payment Sucessful");
      res.json({ status: true })
    }).catch((err) => {
      console.log(err.message, "second then error");

    })
  }).catch((err) => {
    console.log("first then errorr======");
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/user/order_success',(req,res)=>{
  userValue=req.session.user
  // console.log('userValue1',userValue._id)
  // console.log('userValue2',req.session.user._id)

  const deleteCart= userHelper.deletecart(userValue._id)
  total= req.session.total
  res.render('user/order_success',{userValue,total})
})


/* display-order */
router.get('/display-order',async(req,res)=>{
  userValue=req.session.user
  let orders=await userHelper.getUserOrders(req.session.user._id)
  res.render('user/display_order',{userValue,orders})

})


/* cancel order */

router.get("/cancel/:id", (req, res) => {
  const proId = req.params.id; 
  console.log(proId);
  console.log("sdjfhusguasuashguahshasdgs");
  userHelper.cancel(proId).then((response) => {
    res.json({status:true})
    });
});
router.get("/cancelled/:id", (req, res) => {
  const proId = req.params.id;
  console.log("esfhusayfuahiuashahsfhasdu");
  userHelper.cancelled(proId).then((response) => {  
  });
});


//get orderproducts render
router.get('/view-orderproducts/:id',async(req,res)=>{
  userValue=req.session.user
  let orderproduct=await userHelper.getOrderProducts(req.params.id)
  console.log(orderproduct,5555555555);
  res.render('user/view-orderproducts',{orderproduct,userValue})
})
// Multiplication
// router.post('/multy',(req,res)=>{
//   userHelper.multipli(req.body).then((response)=>{
//     res.json(response)
//   })
// })

router.get('/logout',(req,res)=>{
  console.log("logout11111"); 
  console.log("logout",req.session.user); 

  req.session.user=null
  // req.session.user.destroy()
    
  res.redirect('/login');
})


module.exports = router;
