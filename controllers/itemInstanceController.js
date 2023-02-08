const ItemInstance = require("../models/item_instance");

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
exports.iteminstance_detail = (req, res) => {
  res.send(`NOT IMPLEMENTED: itemInstance detail: ${req.params.id}`);
};

// Display itemInstance create form on GET.
exports.iteminstance_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance create GET");
};

// Handle itemInstance create on POST.
exports.iteminstance_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance create POST");
};

// Display itemInstance delete form on GET.
exports.iteminstance_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance delete GET");
};

// Handle itemInstance delete on POST.
exports.iteminstance_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance delete POST");
};

// Display itemInstance update form on GET.
exports.iteminstance_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance update GET");
};

// Handle iteminstance update on POST.
exports.iteminstance_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: itemInstance update POST");
};
