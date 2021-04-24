//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const { urlencoded } = require("body-parser");

const app = express();

// console.log(md5("12345"));

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

//moongoose encrypt is added as a plugin to the schema and then we have to pass secret as JS object
// const secret = "This is our secret";
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ["password"]});

const User = new mongoose.model("User",userSchema);


app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
    const newUser = new User({
        email:req.body.username,
        // password:req.body.password
        password:md5(req.body.password)
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.render("secrets");
        }
    });

});

app.post("/login",function(req,res){
    //obtained from the login page
    const username = req.body.username;
    const password = md5(req.body.password);

    //email - already stored in DB
    //username - entry from login form
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen("3000",function(){
    console.log("Server started at port 3000");
});