const async = require("async");
const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = (req, res, next) => {
  Category.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", {
        title: "Category List",
        category_list: list_categories,
      });
    });
};

// Display detail page for a specific category.
exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        const err = new Error("category not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("category_detail", {
        title: results.category.name,
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = (req, res) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("name must be specified.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name has non-alphanumeric characters."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Description has non-alphanumeric characters."),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    category.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new category record.
      res.redirect(category.url);
    });
  },
];

// Display category delete form on GET.
exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      categories_items(callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/catalog/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_items: results.categories_items,
      });
    }
  );
};

// Handle category delete on POST.
exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      categories_items(callback) {
        Item.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.categories_items.length > 0) {
        // category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete category",
          category: results.category,
          category_items: results.categories_items,
        });
        return;
      }
      // category has no items. Delete object and redirect to the list of categories.
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to category list
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Display category update form on GET.
exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id, function (err, category) {
    if (err) {
      return next(err);
    }
    if (category == null) {
      // No results.
      const err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("category_form", {
      title: "Update category",
      category: category,
    });
  });
};

// Handle category update on POST.
exports.category_update_post = [
  // Validate and santize fields.
  body("name")
    .trim()
    .isLength({ min: 1, max: 30 })
    .escape()
    .withMessage("Category must be specified.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Category has non-alphanumeric characters."),
  body("description")
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage("Description must be specified.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Category has non-alphanumeric characters."),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create category object with escaped and trimmed data (and the old id!)
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("category_form", {
        title: "Update category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        function (err, thecategory) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to genre detail page.
          res.redirect(thecategory.url);
        }
      );
    }
  },
];
