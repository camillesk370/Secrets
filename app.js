require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
};

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res) {
  res.render("home");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login", {checkPassword: "", username: "", password: ""});
});

app.post("/register", function(req, res) {

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    const newUser = new User ({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err) {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });

});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser) {
    if (!err) {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          } else {
            res.render("login", {checkPassword: "Email or password incorrect", username: username, password: password});
          }
        });
      } else {
        res.render("login", {checkPassword: "You haven't registered yet.", username: username, password: password});
      }
    } else {
      console.log(err);
    }
  })
});













app.listen(3000, function() {
  console.log("Server started on port 3000");
});
