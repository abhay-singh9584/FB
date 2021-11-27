var express = require('express');
const passport = require('passport');
// const users = require('./users');
var router = express.Router();
var userModel=require('./users')
var bookModel=require('./book')
const multer  = require('multer')


const localStrategy = require('passport-local');
const { Passport, session } = require('passport');

const { populate } = require('./users');

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null,uniqueSuffix+file.originalname)
  }
})
const upload = multer({ storage: storage })

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index');
})

router.post('/register',function(req,res ,next){
  var newUser = new userModel({
    username : req.body.username,
    name:req.body.name
  })
  userModel.register(newUser , req.body.password )
  .then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile')
    })
  }).catch(function(e){
    res.send(e);
  })
})

router.get('/like/:p',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(j){
    bookModel.findOne({_id:req.params.p})
    .then(function(i){
      if(i.like.indexOf(j._id)==-1){
        i.like.push(j._id)
      }
      else{
        i.like.pop(j._id)
      }
      i.save()
      .then(function(cs){
        res.redirect('/profile')
      })
  })
  })
})

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req,res,next){
  
})

router.get('/profile',isLoggedIn,function(req,res){
    userModel.findOne({username:req.session.passport.user})
      .then(function(founduser){
        bookModel.find()
        .populate('user')
        .then(function(a){
          userModel.find()
          .then(function(c){
            res.render('profile',{a:a,b:founduser,c:c})
          })
      })
    })
})

router.get('/logout' , function(req, res){
  req.logout();
  res.redirect('/');
})

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

router.get('/delshare/:n',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    i.share.splice(req.params.n,1)
    i.save()
    res.redirect('/recived')
  })
})

router.post('/submit',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(us){
    bookModel.create({
      dis:req.body.dis,
      user:us
    })
    .then(function(u){
      u.populate('book')
      us.books.push(u._id)
      us.save()
    })
    .then(function(cu){
      res.redirect('/profile')
    })
  })
})
  
router.get('/delete/:p',isLoggedIn,function(req,res){
  bookModel.findOneAndDelete({_id:req.params.p})
  .then(function(a){
    res.redirect('/profile')
  })
})

router.get('/update/:p',isLoggedIn,function(req,res){
  bookModel.findOne({_id:req.params.p})
  .populate('user')
  .then(function(a){
    res.render("update",{a})
  })
})

router.post('/edit/:p',isLoggedIn,function(req,res){
  bookModel.findOneAndUpdate({_id:req.params.p},{name:req.body.name,price:req.body.price,dis:req.body.dis,imgurl:req.body.imgurl})
  .then(function(a){
    res.redirect('/profile')
  })
})

router.get("/user",isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate('books')
  .then(function(us){
    res.render('user',{a:us})
  })
})

router.post('/comment/:p',isLoggedIn,function(req,res){
  bookModel.findOne({_id:req.params.p})
  .then(function(a){
    a.comment.push([req.body.comment,req.session.passport.user])
    a.save()
    res.redirect('/profile')
  })
})

router.post('/upload',isLoggedIn,upload.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    i.profilepic.push(req.file.filename)
    i.save()
    res.redirect('/user')
  })
})

router.get('/deleteuser/:p',isLoggedIn,function(req,res){
  userModel.findOneAndDelete({_id:req.params.p})
  .then(function(a){
    res.redirect('/')
  })
})

router.get('/share/:x/:y',function(req,res){
  userModel.findOne({_id:req.params.x})
  .then(function(i){
    bookModel.findOne({_id:req.params.y})
    .populate('user')
    .then(function(j){
        console.log(j.user.name)
        i.share.push([j,j.user.name,j.user.profilepic])
        i.save()
        res.redirect('/profile')
      
    })
  })
})

router.get('/recived',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(b){
    userModel.find()
    .then(function(c){
        res.render('share',{b:b,c:c})
    })
  })
})

router.get('/user/:m',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(i){
    var b=i.profilepic.splice(req.params.m,1)
    i.profilepic.push(b)
    i.save()
    res.redirect('/user')
  })
})

module.exports = router; 

