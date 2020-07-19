//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

// hash degeri degismez, sifreyi buraya yazinca da ayni hash degeri doner.
console.log(md5("123456"));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// email ve password'u kaydetmek icin database olusturdum.
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

//setup new user database
//javascript objesinden mongoose Schema classindan olusturulmus bir objeye cevirdm.
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

/** Level 2 Authentication */

const User = new mongoose.model("User", userSchema);

/** Level 1 Authentication */
// kullanicinin sifresini database'de plain text olarak gorebiliriz, bu da istenilen bir sey degildir.
/////////////////////////// Register ///////////////////////////////////////
app.post("/register", function (req, res) {
    const newUser = new User({
        //kullanicinin forma girdigi datayi aliriz.
        email: req.body.username,
        // password'u irreversible hash'e cevir.
        password: md5(req.body.password)
    });
    newUser.save(function (err) {
        if (!err) {
            // secret route'una register olduysa erisebilir, yoksa erisilemez.
            res.render("secrets");
        } else {
            console.log(err);
        }
    });
});

///////////////////////////// Login ////////////////////////////////////////
app.post("/login", function (req, res) {
    // Girilen login bilgileriyle database'deki bilginin denkligini kontrol ederim.
    const username = req.body.username;
    const password = md5(req.body.password);

    //email verisi database'de yer alirken; login yaparken username bilgisi gelir.
    //email ile username alaninin match etmesi lazim.
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            // bu email ile uyusan bir kullanici varsa
            if (foundUser) {
                //bu kullanicinin veritabanindaki hashlenmis sifresi login yaparkenki
                // hashlenmis sifre ile uyusuyor mu
                if (foundUser.password === password) {
                    // kullanici adi ve sifre eslestigi icin server authenticate eder.
                    res.render("secrets");
                }
            }
        }
    });
});


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.listen(3000, function () {
    console.log("Server started on server 3000.");
});