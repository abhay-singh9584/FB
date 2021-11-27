var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
const { Passport } = require('passport');
const passport = require('passport');
var passportLocalMongoose  =require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/AuthLogin')

var userSchema=mongoose.Schema({
  username:String,
  name:String,
  password:String,
  profilepic:{
    type:Array,
  },
  share:Array,
  books:[{type:mongoose.Schema.Types.ObjectId,ref:'book'}]
})
userSchema.plugin(passportLocalMongoose);
// mongoose.plugin(passportLocalMongoose)

module.exports=mongoose.model('user',userSchema)