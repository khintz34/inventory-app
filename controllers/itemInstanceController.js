const ItemInstance = require("../models/item_instance");
const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const async = require("async");
const Location = require("../models/location");

// Display list of all itemInstances.
exports.iteminstance_list = (req, res, next) => {
  ItemInstance.find()
    .populate("item")
    .populate("location")
    .exec(function (err, list_iteminstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("iteminstance_list", {
        title: "Item Instance List",
        iteminstance_list: list_iteminstances,
      });
    });
};

// Display detail page for a specific itemInstance.
exports.iteminstance_detail = (req, res, next) => {
  ItemInstance.findById(req.params.id)
    .populate("item")
    .populate("location")
    .exec(function (err, iteminstance) {
      if (err) {
        return next(err);
      }

      if (iteminstance == null) {
        // No results.
        const err = new Error("item instance not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("iteminstance_detail", {
        title: "Item Instance List",
        iteminstance: iteminstance,
      });
    });
};

// Display ItemInstance create form on GET.
exports.iteminstance_create_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.find({}, "name").exec(callback);
      },
      location(callback) {
        Location.find({}, "name").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("iteminstance_form", {
        title: "Create Item Instance",
        item_list: results.item,
        location_list: results.location,
      });
    }
  );
};

// Handle iteminstance create on POST.
exports.iteminstance_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.location)) {
      req.body.locaation =
        typeof req.body.location === "undefined" ? [] : [req.body.location];
    }
    next();
  },
  // Validate and sanitize fields.
  body("item", "item must be specified").trim().isLength({ min: 1 }).escape(),
  body("location", "Location must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a iteminstance object with escaped and trimmed data.
    const iteminstance = new ItemInstance({
      item: req.body.item,
      location: req.body.location,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      // Get all authors and genres for form.
      async.parallel(
        {
          locations(callback) {
            Location.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const location of results.locations) {
            if (iteminstance.category.includes(location._id)) {
              location.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create ItemInstance",
            locations: results.locations,
            iteminstance,
            errors: errors.array(),
          });
        }
      );

      return;
    }

    // Data from form is valid.
    iteminstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new record.
      res.redirect(iteminstance.url);
    });
  },
];

// Display itemInstance delete form on GET.
exports.iteminstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      iteminstance(callback) {
        ItemInstance.findById(req.params.id)
          .populate("item")
          .populate("location")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.iteminstance == null) {
        // No results.
        res.redirect("/catalog/iteminstances");
      }
      // Successful, so render.
      res.render("iteminstance_delete", {
        title: "Delete Item Instance",
        iteminstance: results.iteminstance,
      });
    }
  );
};

// Handle itemInstance delete on POST.
exports.iteminstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      iteminstance(callback) {
        ItemInstance.findById(req.body.locationid).exec(callback);
      },
    },
    (err) => {
      if (err) {
        return next(err);
      }
      // Success
      // Author has no items. Delete object and redirect to the list of authors.
      ItemInstance.findByIdAndRemove(req.body.iteminstanceid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/catalog/iteminstances");
      });
    }
  );
};

// Display itemInstance update form on GET.
exports.iteminstance_update_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.find({}, "name").populate("name").exec(callback);
      },
      location(callback) {
        Location.find({}, "name").populate("name").exec(callback);
      },
      iteminstance: function (callback) {
        ItemInstance.findById(req.params.id)
          .populate("item")
          .populate("location")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      for (const location of results.location) {
        let itemLocation = results.iteminstance.location;
        if (location._id.toString() === itemLocation._id.toString()) {
          location.checked = "true";
        }
      }
      // Successful, so render.
      res.render("iteminstance_form", {
        title: "Update Item Instance",
        item_list: results.item,
        location_list: results.location,
        selected_location: results.iteminstance.location._id,
        selected_item: results.iteminstance.item._id,
      });
    }
  );
};

// Handle itemInstance update on POST.
exports.iteminstance_update_post = [
  // Validate and sanitize fields.
  body("item", "item must be specified").trim().isLength({ min: 1 }).escape(),
  body("location", "Location must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a itemInstance object with escaped/trimmed data and current id.
    var iteminstance = new ItemInstance({
      item: req.body.item,
      location: req.body.location,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Item.find({}, "name").exec(function (err, items) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("iteminstance_form", {
          title: "Update itemInstance",
          item_list: items,
          selected_item: iteminstance.item._id,
          errors: errors.array(),
          iteminstance: iteminstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      ItemInstance.findByIdAndUpdate(
        req.params.id,
        iteminstance,
        {},
        function (err, theiteminstance) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to detail page.
          res.redirect(theiteminstance.url);
        }
      );
    }
  },
];
