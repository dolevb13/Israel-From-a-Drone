var express = require("express");
var router = express.Router();
var Place = require("../models/place");
var middleware = require("../middleware");

var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

var geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
    Place.find({}, function(err, allPlaces){
       if(err){
           console.log(err);
       } else {
          res.render("places/index",{places: allPlaces, page: 'places'});
       }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }

    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newPlace = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    
    Place.create(newPlace, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/places");
        }
    });
  });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("places/new");
});

router.get("/:id", function (req, res) {
  Place.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundPlace) {
      if (err) {
        console.log(err);
      } else {
        if (!foundPlace) {
          return res.status(400).send("Item not found.");
        }
        res.render("places/show", { place: foundPlace });
      }
    });
});

router.get("/:id/edit", middleware.checkPlaceOwnership, function (req, res) {
  Place.findById(req.params.id, function (err, foundPlace) {
    if (!foundPlace) {
      return res.status(400).send("Item not found.");
    }
    res.render("places/edit", { place: foundPlace });
  });
});


router.put("/:id", middleware.checkPlaceOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.place.lat = data[0].latitude;
    req.body.place.lng = data[0].longitude;
    req.body.place.location = data[0].formattedAddress;

    Place.findByIdAndUpdate(req.params.id, req.body.place, function(err, place){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/places/" + place._id);
        }
    });
  });
});

router.delete("/:id", middleware.checkPlaceOwnership, function (req, res) {
  Place.findByIdAndRemove(req.params.id, { useFindAndModify: false }, function (
    err
  ) {
    if (err) {
      res.redirect("/places");
    } else {
      res.redirect("/places");
    }
  });
});

module.exports = router;
