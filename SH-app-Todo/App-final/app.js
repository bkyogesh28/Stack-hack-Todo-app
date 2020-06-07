//jshint esversion:6

require('dotenv').config();
// const https = require('https');
// const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const db=require('./db/mongoose')
const taskmod=require('./models/task')
// const port = 4000;
//passport-local-mongoose depends on passport-local in its code we dont' need to require passport-local
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({

    email: String,
    password: String,
    googleId: String, //to store the google id  of the user to find or create their details in the database
    facebookId: String, //to store the facebook id  of the user to find or create their details in the database
    githubId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//to create a new google strategy

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/todohk",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id, username: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));

//using a new facebook strategy

// passport.use(new FacebookStrategy({

//         clientID: process.env.FACEBOOK_APP_ID,

//         clientSecret: process.env.FACEBOOK_APP_SECRET,

//         callbackURL: "https://localhost:4000/auth/facebook/todohk"

//     },

//     function(accessToken, refreshToken, profile, cb) {

//         User.findOrCreate({ facebookId: profile.id, username: profile.id }, function(err, user) {

//             return cb(err, user);

//         });

//     }

// ));

//using a new GitHub strategy

passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/todohk"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ githubId: profile.id, username: profile.username }, function(err, user) {
            return done(err, user);
        });
    }
));


app.get("/", function(req, res) {
    res.render("register");
});


// const httpsOptions = {
//     key: fs.readFileSync('./security/cert.key'),
//     cert: fs.readFileSync('./security/cert.pem')
// }
app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/todohk",
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/todohk');
    });

//facebook

// app.get('/auth/facebook',
//     passport.authenticate('facebook', { scope: ["email"] }));

// app.get('/auth/facebook/todohk',
//     passport.authenticate('facebook', { failureRedirect: '/login' }),
//     function(req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/todohk');
//     });

//GITHUB 
app.get('/home',(req,res)=>{
    res.render('todo')
})
app.post('/home',async(req,res)=>{
    const t=new taskmod(req.body)
    try{
        await t.save()
        res.status(200).send()
  
    }catch(e){
          res.status(400).send(e)
    }
  })

 app.get('/savedtasks',(req,res)=>{
     taskmod.find({},(err,data)=>{
        try{
            res.render('savedtasks',{data:data})
        }catch(e){
            res.status(400).send(e)
            res.send("No records founded")
        }
     })


 }) 
app.get('/auth/github',
    passport.authenticate('github', { scope: ["user:email"] }));

app.get('/auth/github/todohk',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/todohk');
    });

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/todohk", function(req, res) {
    //is user logged in?
    if (req.isAuthenticated()) {
        res.render("todohk");
        // res.redirect("https://www.google.com");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

//Using passport

app.post("/register", function(req, res) {

    User.register({
        username: req.body.username
    }, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() { //this call back only triggered if auth succesful and cookie setup and saved
                res.redirect("/home"); //here we rdirect here so if user goes directly to secrets page they can authomativally view if still logged in
            })
        }
    })

});



app.post("/login", function(req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/home");
            });
        }
    });
});




// const server = https.createServer(httpsOptions, app)
//     .listen(port, () => {
//         console.log('server running at ' + port)
//     })

app.listen(5000, function() {
    console.log("server started on port 5000");
});
