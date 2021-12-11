var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
const { Passport } = require('passport');
const passport = require('passport');
var passportLocalMongoose  =require('passport-local-mongoose');

mongoose.connect('mongodb+srv://abhay9584:abhay9584@cluster0.xfnpo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

var userSchema=mongoose.Schema({
  username:String,
  name:String,
  password:String,
  profilepic:{
    type:Array,
  },
  share:Array,
  secret:String,
  books:[{type:mongoose.Schema.Types.ObjectId,ref:'book'}],
  friends:Array

})
userSchema.plugin(passportLocalMongoose);
// mongoose.plugin(passportLocalMongoose)

module.exports=mongoose.model('user',userSchema)