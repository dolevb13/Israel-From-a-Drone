var express = require("express");
var router = express.Router({ mergeParams: true });
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function (req, res) {
  Place.findById(req.params.id, function (err, place) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { place: place });
    }
  });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
  Place.findById(req.params.id, function (err, place) {
    if (err) {
      console.log(err);
      res.redirect("/places");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Something went wrong");
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          place.comments.push(comment);
          place.save();
          req.flash("success", "Successfully added comment");
          res.redirect("/places/" + place._id);
        }
      });
    }
  });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findById(req.params.comment_id, function (err, foundComment) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        place_id: req.params.id,
        comment: foundComment,
      });
    }
  });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    { useFindAndModify: false },
    function (err, updatedComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/places/" + req.params.id);
      }
    }
  );
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findByIdAndRemove(
    req.params.comment_id,
    { useFindAndModify: false },
    function (err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Comment deleted");
        res.redirect("/places/" + req.params.id);
      }
    }
  );
});

module.exports = router;
