var middlewareObj = {};
var Place = require("../models/place");
var Comment = require("../models/comment");

middlewareObj.checkPlaceOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Place.findById(req.params.id, function (err, foundPlace) {
      if (err) {
        req.flash("Place not found");
        res.redirect("back");
      } else {
        if (!foundPlace) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        if (foundPlace.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        if (!foundComment) {
          req.flash("error", "Item not found.");
          return res.redirect("back");
        }
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

module.exports = middlewareObj;
