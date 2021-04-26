//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { urlencoded } = require("body-parser");

const app = express();

// console.log(md5("12345"));

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

//setting up of session
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

//sets up passport for authentication or for managing the sessions
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

//enabling of passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

//moongoose encrypt is added as a plugin to the schema and then we have to pass secret as JS object
// const secret = "This is our secret";
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);

//configure passport local
//allows user to authenticate using username and passowrd
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.post("/register",function(req,res){

    User.register({username: req.body.username}, req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })

});

app.post("/login",function(req,res){

    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
    
});

// app.post("/register",function(req,res){

//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//         // Store hash in your password DB.
//         const newUser = new User({
//             email:req.body.username,
//             // password:req.body.password
//             // password:md5(req.body.password)
//             password:hash
//         });
    
//         newUser.save(function(err){
//             if(err){
//                 console.log(err);
//             }
//             else{
//                 res.render("secrets");
//             }
//         });
//     });    

// });

// app.post("/login",function(req,res){
//     //obtained from the login page
//     const username = req.body.username;
//     // const password = md5(req.body.password);
//     const password = req.body.password;
    
//     //email - already stored in DB
//     //username - entry from login form
//     User.findOne({email:username},function(err,foundUser){
//         if(err){
//             console.log(err);
//         }
//         else{
//             if(foundUser){
//                 // if(foundUser.password === password){
//                 //     res.render("secrets");
//                 // }
//                 // Load hash from your password DB.
//                 bcrypt.compare(password, foundUser.password, function(err, result) {
//                 // result == true
//                     if(result === true){
//                         res.render("secrets");
//                     }
//                 });
                
//             }
//         }
//     });
// });

app.listen("3000",function(){
    console.log("Server started at port 3000");
});