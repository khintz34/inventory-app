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
  res.render("location_form", { title: "Create Store" });
};

// Handle Location create on POST.
exports.location_create_post = [
  // Validate and sanitize the name field.
  body("name", "Location name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a location object with escaped and trimmed data.
    const location = new Location({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("location_form", {
        title: "Create Store",
        location,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if location with same name already exists.
      Location.findOne({ name: req.body.name }).exec((err, found_location) => {
        if (err) {
          return next(err);
        }

        if (found_location) {
          // Location exists, redirect to its detail page.
          res.redirect(found_location.url);
        } else {
          location.save((err) => {
            if (err) {
              return next(err);
            }
            // Location saved. Redirect to location detail page.
            res.redirect(location.url);
          });
        }
      });
    }
  },
];

// Display Location delete form on GET.
exports.location_delete_get = (req, res, next) => {
  async.parallel(
    {
      location(callback) {
        Location.findById(req.params.id).exec(callback);
      },
      locations_items(callback) {
        item_instance
          .find({ location: req.params.id })
          .populate("item")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.location == null) {
        // No results.
        res.redirect("/catalog/locations");
      }
      // Successful, so render.
      res.render("location_delete", {
        title: "Delete location",
        location: results.location,
        location_items: results.locations_items,
      });
    }
  );
};

// Handle location delete on POST.
exports.location_delete_post = (req, res, next) => {
  async.parallel(
    {
      location(callback) {
        Location.findById(req.body.locationid).exec(callback);
      },
      locations_items(callback) {
        Item.find({ location: req.body.locationid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.locations_items.length > 0) {
        // location has items. Render in same way as for GET route.
        res.render("location_delete", {
          title: "Delete location",
          location: results.location,
          location_items: results.locations_items,
        });
        return;
      }
      // location has no items. Delete object and redirect to the list of locations.
      Location.findByIdAndRemove(req.body.locationid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to location list
        res.redirect("/catalog/locations");
      });
    }
  );
};

// Display location update form on GET.
exports.location_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: location update GET");
};

// Handle location update on POST.
exports.location_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: location update POST");
};
