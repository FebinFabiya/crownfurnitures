var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const adminHelper=require('../helpers/admin-helper')

/* GET home page. */
router.get('/',async function(req, res, next) {
  if(req.session.admin){
    admin=req.session.admin
    let productDetails= await adminHelper.getProduct()
    console.log('admin login001',admin);
    // res.render('admin/admin_home', {admin,productDetails});

res.render('admin/dashboard', {admin,productDetails});
  }else{
    res.redirect('/login');

  }
});
router.get('/product_management',async function(req,res,next){
  if(req.session.admin){
    admin=req.session.admin
    let productDetails= await adminHelper.getProduct()
    console.log('admin login001',admin);
    res.render('admin/admin_product', {admin,productDetails});
  }
})
router.get('/customer_management',async function(req,res,next){
  if(req.session.admin){
    admin=req.session.admin
    let userDetails= await adminHelper.getUser()
    console.log('admin login001',admin);
    res.render('admin/customer', {admin,userDetails});
  }
})
router.get('/add_product',async function(req, res, next) {
  if(req.session.admin){
    admin=req.session.admin
    const category = await adminHelper.getAllCategory();
  // const brandName = await adminHelper.getBrands();
  const subcategory = await adminHelper.getAllSubcategory();
    
    res.render('admin/add_product', { admin,category,subcategory });

  }else{
    res.redirect('/login');

  }
});
router.post('/add_product',adminHelper.upload.single("image"), (req,res)=>{
  if(req.session.admin){
console.log('req.file====',req.file);
adminHelper.addProduct(req.body,req.file).then((Response) => {
console.log('added');
res.redirect('/admin')
  })
}
 
})

//deleteproduct


router.get('/delete-product/:id',(req,res)=>{
  console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeee');
  let proId=req.params.id
  adminHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})
//edit product
router.get('/edit-product/:id',async(req,res)=>{
  let product=await adminHelper.findProduct(req.params.id)
  // let type=await adminHelper.getEventType()
  console.log(product, "event");
res.render('admin/edit_product',{admin:true,product})
})

router.post('/edit-product/:id',adminHelper.upload.single("image"),async(req,res)=>{
  
  let imageData = await adminHelper.getProduct();
  
 
       
      var main_img=req.file ? req.file.filename : imageData[0].Image
      
  await adminHelper.updateProduct(req.params.id,req.body,main_img).then(()=>{
    console.log('success');
    res.redirect('/admin')
    // if(req.fileimage){
    //   let image=req.file.image
    // }
  })
  })

  router.get("/addcategory", async (req, res) => {
    const categories = await adminHelper.getAllCategory();
    console.log(categories);
    res.render("admin/add_category", {
      categories,
      layout: false,
      Err: req.session.loggE,
      Errc: req.session.loggC,
    });
    req.session.loggE = null;
    req.session.loggC = null;
  });

  router.post("/addcategory", (req, res) => {
    console.log(req.body);
    
    console.log("category log");
    adminHelper
      .addCategory(req.body)
      .then((response) => {
        res.redirect("/admin/addcategory");
      })
      .catch((err) => {
        req.session.loggC = err.msg;
        console.log(req.session.loggC);
        res.redirect("/admin/addcategory");
      });
  });

  router.post("/addSubcategory", (req, res) => {
    console.log(req.body);
    console.log("subcategory log");
    adminHelper
      .addSubcategory(req.body)
      .then((response) => {
        res.redirect("/admin/addcategory");
      })
      .catch((err) => {
        req.session.loggSc = err.msg;
        console.log(req.session.loggSc);
        res.redirect("/admin/addcategory");
      });
  });

  router.get("/blockUser/:id", (req, res) => {
    const proId = req.params.id; 
    console.log(proId);
    console.log("sdjfhusguasuashguahshasdgs");
    adminHelper.blockUser(proId).then((response) => {
      res.json({status:true})
      });
  });
  router.get("/unBlockUser/:id", (req, res) => {
    const proId = req.params.id;
    console.log("esfhusayfuahiuashahsfhasdu");
    adminHelper.unBlockUser(proId).then((response) => {  
    });
  });

  /* order list */

  router.get('/order_management',async(req,res)=>{
  let orderList=await adminHelper.getOrderList()
  res.render('admin/order_list',{admin:true,orderList})
  })

  router.get("/ordered/:id", (req, res) => {
    const proId = req.params.id; 
    console.log('admin1',proId);
    console.log("sdjfhusguasuashguahshasdgs");
    adminHelper.ordered(proId).then((response) => {
      res.json({status:true})
      });
  });
  router.get("/shipped/:id", (req, res) => {
    const proId = req.params.id;
    console.log("esfhusayfuahiuashahsfhasdu");
    adminHelper.shipped(proId).then((response) => {  
    });
  });
  
  /* add-banners */
  
  router.get('/add-banners', function(req, res) {
    
    admin=req.session.admin
    adminHelper.getBannerImages(req.session.admin).then((viewBannerImg)=>{
  
  
      console.log(viewBannerImg+'imageeeeeeeeeeis=======');
  
      res.render('admin/add_banner',{admin:true,viewBannerImg})
    })
     
    
    })
    
  
  router.post('/add-banners',adminHelper.upload.single("image"),(req,res)=>{
     console.log('imageeeeee',req.file);
 adminHelper.addBanner(req.file.filename).then((id)=>{
  
  res.redirect('/admin/add-banners')
  })
  
  })

router.get('/logout',(req,res)=>{
  req.session.admin=null
  res.redirect('/')
})


module.exports = router;
