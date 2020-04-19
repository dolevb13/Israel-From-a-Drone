var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function (req, res) {
  res.render("landing");
});


router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});


router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

router.post("/register", function (req, res) {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Welcome to Israel From a Drone, " + user.username);
      res.redirect("/places");
    });
  });
});



router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/places",
    failureRedirect: "/login",
  }),
  function (req, res) {
    var newUser = new User({ username: req.body.username });
    res.send("Login logic happens here");
  }
);

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Logged you out");
  res.redirect("/places");
});

module.exports = router;
