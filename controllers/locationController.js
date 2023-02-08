const async = require("async");
const Location = require("../models/location");
const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const item_instance = require("../models/item_instance");

// Display list of all locations.
exports.location_list = (req, res) => {
  Location.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_locations) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("location_list", {
        title: "Location List",
        location_list: list_locations,
      });
    });
};

// Display detail page for a specific location.
exports.location_detail = (req, res, next) => {
  async.parallel(
    {
      location(callback) {
        Location.findById(req.params.id).exec(callback);
      },

      location_items(callback) {
        item_instance
          .find({ location: req.params.id })
          .populate("item")
          .sort({ item: 1 })
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.location == null) {
        // No results.
        const err = new Error("location not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("location_detail", {
        title: results.location.name,
        location: results.location,
        location_items: results.location_items,
      });
    }
  );
};

// Display location create form on GET.
exports.location_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: location create GET");
};

// Handle location create on POST.
exports.location_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: location create POST");
};

// Display location delete form on GET.
exports.location_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: location delete GET");
};

// Handle location delete on POST.
exports.location_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: location delete POST");
};

// Display location update form on GET.
exports.location_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: location update GET");
};

// Handle location update on POST.
exports.location_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: location update POST");
};
