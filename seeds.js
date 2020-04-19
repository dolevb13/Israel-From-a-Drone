var mongoose = require("mongoose");
var Place = require("./models/place");
var Comment = require("./models/comment");
var data = [
  
];

function seedDB() {
  Place.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    }
    console.log("removed places");

    data.forEach(function (seed) {
      Place.create(seed, function (err, place) {
        // or "data" in place of place
        if (err) {
          console.log(err);
        } else {
          console.log("added a place");
          //create a comment
          Comment.create(
            {
              text: "This place is great, but I wish there was internet",
              author: "Homer",
            },
            function (err, comment) {
              if (err) {
                console.log(err);
              } else {
                place.comments.push(comment);
                place.save();
                console.log("Created new comment");
              }
            }
          );
        }
      });
    });
  });
}

module.exports = seedDB;
