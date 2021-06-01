const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

//connecting to mogodb mogoose database
mongoose.connect("mongodb://localhost:27017/signupDB", {useNewUrlParser: true, useUnifiedTopology: true});


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating global variables to store all the store details
let stores = [];

// home route. rendering home.ejs page
app.get("/",function(req,res){
  res.render("home", {stores: stores});
});

app.get("/signin",function(req,res){
  res.render("signin");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/about",function(req,res){
  res.render("about");
});

app.get("/contact",function(req,res){
  res.render("contact");
});

app.get("/more",function(req,res){
  res.render("more");
});

app.get("/profile",function(req,res){
  res.render("profile");
});


// app.post("/signup", function(req,res){
//   res.redirect("/signin");
// });

//Handling user logout 
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/store",function(req,res){
  res.render("store");
});



// parsing user details from signup into user home page 



//post request for updatestore
app.post("/updatestore",function(req,res){
 
  //creating javascript object to log title and postbody
  const storeDetails = {
    nameOfstore: req.body.storename,
    typeOfstore: req.body.type,
    description: req.body.description,
    name: req.body.fullname,
    phone: req.body.phone,
    email: req.body.email,
    
  };
  stores.push(storeDetails);

  res.redirect("/home2");
});


//express route parameters
app.get("/stores/:storeName",function(req,res){
  const requestedTitle =_.lowerCase(req.params.storeName);
  stores.forEach(function(storeDetails){
    const storedTitle =_.lowerCase(storeDetails.nameOfstore);
    if(requestedTitle === storedTitle){
      res.render("store",{nameOfstore:storeDetails.nameOfstore, typeOfstore:storeDetails.typeOfstore, 
        description:storeDetails.description, name:storeDetails.name, phone:storeDetails.phone, email:storeDetails.email, newListItems: items, stname: requestedTitle});
      
    }

  });

});

// hom2 adding list items

let items = [];

app.get("/home2",function(req,res){
  stores.forEach(function(storeDetails){
  res.render("home2", {newListItems: items,stname:storeDetails.nameOfstore});
});
});
   
app.post("/home2",function(req,res){
  let item = req.body.newItem;
    items.push(item);
    res.redirect("/home2");
});


// signup data to update store
// app.post("/home2/updatestore",function(req,res){ 
//   var name = req.body.fullname;
//   var phone = req.body.phone;
//   var email = req.body.email;
//   res.render("updatestore", {name: name, phone:phone, email: email});
// }); 


// app.get("/home2/updatestore",function(req,res){
//   res.render("updatestore");
// });


// signup data to update store
let users = [];
app.post("/signup", function(req,res){
  const Details = {
    name: req.body.fullname,
    phone: req.body.phone,
    email: req.body.email,
    
  };
  users.push(Details);
  res.redirect("/home2/updatestore");
});

app.get("/home2/updatestore",function(req,res){
  users.forEach(function(detail){
  res.render("updatestore",{fullname:detail.name, phone: detail.phone, email: detail.email});
});

});



// ordering
 app.get("/stores/:storeName/order", function(req, res){
  const stname =_.lowerCase(req.params.storeName);
   res.render("order");
 });


app.listen(3000, function(){
  console.log("server has started on port 3000");
  });

