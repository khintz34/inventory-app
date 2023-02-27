const async = require("async");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Location = require("../models/location");
const ItemInstance = require("../models/item_instance");

exports.index = (req, res) => {
  async.parallel(
    {
      item_count(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      location_count(callback) {
        Location.countDocuments({}, callback);
      },
      item_instance_count(callback) {
        ItemInstance.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all items.
exports.item_list = (req, res, next) => {
  Item.find({}, "name category")
    .sort([["item", "ascending"]])
    .populate("category")
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("item_list", { title: "Item List", item_list: list_items });
    });
};

// Display detail page for a specific item.
exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      item_instance(callback) {
        ItemInstance.find({ item: req.params.id })
          .populate("item")
          .populate("location")
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        console.log(results);
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        title: results.item.name,
        item: results.item,
        item_instances: results.item_instance,
      });
    }
  );
};

// Display item create form on GET.
exports.item_create_get = (req, res, next) => {
  // Get all locations and categories, which we can use for adding to our item.
  async.parallel(
    {
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // console.log(results.categories);
      res.render("item_form", {
        title: "Create Item",
        categories: results.categories,
      });
    }
  );
};

// Handle item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty")
    .trim()
    .isLength({ min: 1 })
    .isNumeric()
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories and genres for form.
      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categorues as checked.
          for (const category of results.categories) {
            if (item.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          console.log(results.categories);
          res.render("item_form", {
            title: "Create Item",
            categories: results.categories,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save item.
    item.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new item record.
      res.redirect(item.url);
    });
  },
];

// Display item delete form on GET.
exports.item_delete_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      },
      item_instances(callback) {
        ItemInstance.find({ item: req.params.id })
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
        res.redirect("/catalog/items");
      }
      // Successful, so render.
      res.render("item_delete", {
        title: "Delete item",
        item: results.item,
        item_instances: results.item_instances,
      });
    }
  );
};

// Handle item delete on POST.
exports.item_delete_post = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.body.itemid).exec(callback);
      },
      item_instances(callback) {
        ItemInstance.find({ item: req.body.itemid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.items_instances.length > 0) {
        // item has items. Render in same way as for GET route.
        res.render("item_delete", {
          title: "Delete item",
          item: results.item,
          item_items: results.items_items,
        });
        return;
      }
      // item has no items. Delete object and redirect to the list of items.
      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to item list
        res.redirect("/catalog/items");
      });
    }
  );
};

// Display item update form on GET.
exports.item_update_get = (req, res, next) => {
  // Get item, categories and genres for form.
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate("category").exec(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Allow for category list.
      for (const category of results.categories) {
        let itemCategory = results.item.category;
        if (category._id.toString() === itemCategory._id.toString()) {
          category.checked = "true";
        }
      }
      res.render("item_form", {
        title: "Update item",
        categories: results.categories,
        item: results.item,
      });
    }
  );
};

// Handle item update on POST.
exports.item_update_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category", "category must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped/trimmed data and old id.
    const item = new Item({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories and genres for form.
      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Mark our selected categories as checked.
          for (const category of results.categories) {
            console.log(category);
            if (item.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Update Item",
            categories: results.categories,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to item detail page.
      res.redirect(theitem.url);
    });
  },
];
