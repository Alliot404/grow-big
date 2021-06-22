const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");


const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "my secret  page.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


//connecting to mogodb mogoose database
mongoose.connect("mongodb://localhost:27017/userdb", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

// signup data to update store after  database
//creating signupschema
const userSchema = new mongoose.Schema ({
  usertype: String, 
  name: String,
  phone: Number,
  email: String,
  password: String,
  storename: String,
  storelocation: String,
  storeaddress: String,
  storedescription: String,

  customertype: String,
  username: String,
  password: String,
  cfullname: String,
  cphone: Number,
  caddress: String,
  ccity: String,
  cstate: String,
  cpin: Number,
  ctime: String,
  cstorename: String
});

userSchema.plugin(passportLocalMongoose);

//mongoose model using above Schema
const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//creating global variables to store all the store details
// let stores = [];

// home route. rendering home.ejs page
const customer2 = "Customer as Guest";
app.get("/",function(req,res){
  // User.find({usertype: "user"}, function(err, users){
  //   res.render("home", {user: users});
  // });

   if(req.isAuthenticated()){
    User.find({usertype: "user"}, function(err, users){
      User.findById({_id: req.user.id}, function(err, cust){
        res.render("home", {user: users, customer: cust});
      });
      
    });
   }
   else{
  User.find({usertype: "user"}, function(err, users){
    User.findOne({customertype:"customer"}, function(err, cust){
    res.render("home", {user: users, customer: customer2});
  });
  });
   }
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

app.get("/forgot",function(req,res){
  res.render("forgot");
});


//Handling user logout 
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});


app.get("/signin",function(req,res){
  res.render("signin");
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/logins",function(req,res){
  res.render("logins");
});

app.get("/csignin",function(req,res){
  res.render("csignin");
});

app.get("/csignup",function(req,res){
  res.render("csignup");
});


//Signup route through passport
app.post("/signup", function(req,res){
    Users = new User({
    name: req.body.fullname,
    phone: req.body.phone,
    username: req.body.username,
    usertype: req.body.usertype
  });
  User.register(Users, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/signup");
      }
      else{
        passport.authenticate("local")(req, res, function(){
          if(req.isAuthenticated()){
            console.log(req.user.id);
            res.redirect("/home2/updatestore");
           
          }

        });

      }
    });
    
});


app.post("/signin", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home2");
        
      });
    }
  });
});


app.get("/home2/updatestore", function(req,res){
  if(req.isAuthenticated()){
    console.log(req.user.id);
    User.findById(req.user.id, function(err, userfound){
      if(err){
        console.log(err);
      }
      else{
        if(userfound){
        res.render("updatestore",{user:userfound});
      }
      }
    });
   
  }
  else{
    res.redirect("/signin");
  }
});


app.post("/updatestore",function(req,res){
 
  if(req.isAuthenticated()){
    User.findByIdAndUpdate(req.user.id,
      {storename: req.body.storename,
      storelocation: req.body.location,
      storeaddress:req.body.address, 
      storedescription: req.body.description,
      name:req.body.fullname, 
      phone: req.body.phone,},
       function(err, user){
      if(err){
        console.log(err);
      }
      else{
        user.save(function(){
          res.redirect("/home2");
          // res.render("home2", {user: user});
        });
      }
    });
  }
  
});


app.get("/home2",function(req,res){

  if(req.isAuthenticated()){
    User.findById({_id: req.user.id}, function(err, userfound){
      console.log(req.user.storename);
      User.countDocuments({customertype: 'customer', cstorename: req.user.storename}, function(err, c) {
      
      if(err){
        console.log(err);
      }
      else{
        if(userfound){
        res.render("home2", {user: userfound, count:c});
        }
      }
    });
  });
   
  }
  else{
    res.redirect("/signin");
  }

});

////////////////////////adding storeitems//////////////////////////////////////////////////////////////////////////

//creating mongoose schema
const itemsSchema = {
  name: String,
  price: Number
};

//mongoose model based on the schema
const Item = mongoose.model("Item",itemsSchema);

// creating new documents with mongoose
const item1 = new Item ({
  name: "Add items",
  price: 00
});

const item2 = new Item ({
  name: "Delete items",
  price: 00
});


const defaultItems =  [item1,item2]; // created default item array

//new list Schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/home3", function(req, res){
  if(req.isAuthenticated()){
    Item.find({},function(err,foundItems){
      User.findById({_id: req.user.id}, function(err, founduser){
      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully saved default items to DB");
          }
        });
        res.redirect("/home3");
      }
      else{ 
        res.render("list", {listTitle: "Today", newListItems: foundItems, user: founduser});//passing founditems into list.ejs
   
      }
    });
  });
   
  }
  else{
    res.redirect("/signin");
  }
});

//handles the post request to the home route
app.post("/home3",function(req,res){

  const itemName = req.body.newItem;
  const itemprice = req.body.price;
  const listName = req.body.list;  // adding new items to new list

  const item = new Item({
    name: itemName,
    price: itemprice
  });
if(req.isAuthenticated()){
// creating new document of Item

  if (listName === "Today"){
    item.save();
    res.redirect("/home3/"); //after saving we redirect to home and new foundItems will be added
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/home3/"+listName);
    });
  }
}
else{
  res.redirect("/signin");
}
});

app.get("/home3/:customeListname", function(req,res){
  const customeListname= _.lowerCase(req.params.customeListname);

    //findone method to avoid creating many home list data
List.findOne({name: customeListname}, function(err, foundList){
  User.findById({_id: req.user.id}, function(err, founduser){
  if(!err){
    if(!foundList){
      //create a new list
      //creating new list document with mongoose
      const list = new List({
        name: customeListname,
        price: req.body.price,
        items: defaultItems
      });

      list.save();
      res.redirect("/home3/" + customeListname);
    }
    else{
      //show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items, user: founduser});
    }
  }
});
})

});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=== "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/home3/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/home3/"+listName);
      }
    });
  }
});



////////////////////////////stores///////////////////////////////////////////////////////////////////////


// const customerSchema = {
//   cusername: String,
//   cpassword: String,
//   cfullname: String,
//   cphone: Number,
//   caddress: String,
//   ccity: String,
//   cstate: String,
//   cpin: Number
// };

// const Customer = mongoose.model("Customer", customerSchema );

app.get("/csignup", function(req, res){
  res.render("csignup");
});

app.post("/csignup", function(req, res){
  const customer = new User({
    username: req.body.username,
    customertype: req.body.customertype
  });

  User.register(customer, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/csignup");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        if(req.isAuthenticated()){
          console.log(req.user.id);
          res.redirect("/");
         
        }

      });

    }
  });

  // customer.save();
  // res.redirect("/");
});

app.post("/csignin", function(req, res){
 const user = new User({
  username: req.body.username,
  password: req.body.password
 });
  //  const cUsername=req.body.username;
  //   const cPassword=req.body.password;
 
    req.login(user, function(err){
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/");
          
        });
      }
    });
//  User.findOne({cusername: cUsername}, function(err, cfound){
//    if(err){
//      console.log(err);
//    }
//      else{
//        if(cfound){
//          if(cfound.cpassword===cPassword){
//           res.redirect("/");
//          }
//          else{
//           res.send("wrong details");
//         }
//        }
       
//      }
//  });

});

app.get("/store",function(req,res){
  res.render("store");
});

app.get("/stores/:storeName",function(req,res){

  const requestedTitle =_.lowerCase(req.params.storeName);
  const checkeditemid = req.body.checkbox;


  if(req.isAuthenticated()){
    User.findById({_id: req.user.id}, function(err, cust){
      Order.find({}, function(err, orderfound){
   
        User.find({}, function(err, users){
          
          users.forEach(function(user){
         
            const storedTitle =_.lowerCase(user.storename);
            if(requestedTitle === storedTitle){
              const stname = user.storename;
              List.findOne({name: stname}, function(err, foundList){
                
              res.render("store", {users: user, newListItems: foundList.items, name: checkeditemid, orders:orderfound, customer: cust});
           
            });
            }  
        });
          });
        });
    });
  }
  else{
 Order.find({}, function(err, orderfound){
   
  User.find({}, function(err, users){
    
    users.forEach(function(user){
   
      const storedTitle =_.lowerCase(user.storename);
      if(requestedTitle === storedTitle){
        const stname = user.storename;
        List.findOne({name: stname}, function(err, foundList){
          
        res.render("store", {users: user, newListItems: foundList.items, name: checkeditemid, orders:orderfound, customer: customer2});
     
      });
      }  
  });
    });
  });
}
});

const orderSchema = {
  stname: String,
  name: String,
  price: Number
};

const Order = mongoose.model("Order",orderSchema);

app.post("/stores/:storeName", function(req, res){
  const requestedTitle =_.lowerCase(req.params.storeName);
 
  const order = new Order({
    stname: requestedTitle,
    name: req.body.itemname,
    price: req.body.price
  });

  if(req.isAuthenticated()){
    console.log(req.user.id);
  order.save(function(err){
    if (!err){
      res.redirect("/stores/" + requestedTitle);
    }
  });
}
else{
  res.redirect("/csignin");
}
});


app.post("/orderdelete", function(req, res){
  const stName = req.body.stname;
const removeId = req.body.remove;
Order.findByIdAndRemove(removeId,function(err){
  if(!err){
    console.log("Successfully deleted checked item");
    res.redirect("/stores/" + stName);
  }
  else{
    console.log(err);
  }
});
});


///////////////////////////////////////////cart/////////////////////////////////
const cartSchema = {
  username: String,
  storename: String,
  name: [String],
  price: [Number]
};

const Cart = mongoose.model("Cart",cartSchema);

 app.post("/stores/:storeName/next", function(req, res){
  const stname =_.lowerCase(req.params.storeName);
const username = req.body.username;

const cartitems = new Cart({
  username: username,
  storename: stname,
  name: req.body.itemname,
  price: req.body.itemprice
});

if(req.isAuthenticated()){

cartitems.save();

res.redirect("/stores/" + stname + "/order");
}
else{
  res.redirect("/csignin");
}
 });

 
// ordering 
app.get("/stores/:storeName/order", function(req, res){
  const stname =_.lowerCase(req.params.storeName);
   res.render("order",{storename: stname});
 });

 app.post("/order", function(req, res){
   console.log(req.body.state);
  
if(req.isAuthenticated()){
  User.findByIdAndUpdate(req.user.id,{
    cfullname: req.body.fullname,
    cphone: req.body.phone,
    cpin: req.body.city,
    caddress: req.body.address,
    cstate: req.body.state,
    ccity: req.body.city,
    cpin: req.body.pin,
    ctime: req.body.time,
    cstorename: req.body.storename
  }, function(err, user){
    if(err){
      console.log(err);
    }
    else{
      user.save(function(){
        res.redirect("/");
        // res.render("home2", {user: user});
      });
    }

  });
}
else{
  res.redirect("/csignin");
}
  // customer2.save();
  // res.redirect("/");
 });

 app.post("/forgot",function(req,res){
   const userName = req.body.username;

     User.findOneAndUpdate({username: userName}, {password: req.body.password}, function(err, user){
      if(err){
        console.log(err);
      }
      else{
        user.save(function(){
          res.redirect("/logins");
        
        });
      }

     });
   
});

app.get("/home2/delivary", function(req, res){

  if(req.isAuthenticated()){
    const stname = req.user.storename;
    console.log(stname);
  User.find({cstorename: stname}, function(err, founduser){
    founduser.forEach(function(user){
      console.log(user.username);
    Cart.find({storename: stname, username: user.username}, function(err, cart){
      console.log(cart);
      cart.forEach(function(cartitems){
        console.log(cartitems);
        console.log(cartitems.name);
    
    res.render("delivary",{customers: founduser, items: cartitems.name});
  });
  });
  });
});
}
else{
  res.redirect("/signin");
}

});


app.listen(3000, function(){
  console.log("server has started on port 3000");
  });

