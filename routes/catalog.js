const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController");
const location_controller = require("../controllers/locationController");
const item_instance_controller = require("../controllers/itemInstanceController");

/// Item ROUTES ///

// GET catalog home page.
router.get("/", item_controller.index);

// GET request for creating a Item. NOTE This must come before routes that display Item (uses id).
router.get("/item/create", item_controller.item_create_get);

// POST request for creating item.
router.post("/item/create", item_controller.item_create_post);

// GET request to delete item.
router.get("/item/:id/delete", item_controller.item_delete_get);

// POST request to delete item.
router.post("/item/:id/delete", item_controller.item_delete_post);

// GET request to update item.
router.get("/item/:id/update", item_controller.item_update_get);

// POST request to update item.
router.post("/item/:id/update", item_controller.item_update_post);

// GET request for one item.
router.get("/item/:id", item_controller.item_detail);

// GET request for list of all item items.
router.get("/items", item_controller.item_list);

/// category ROUTES ///

// GET request for creating category. NOTE This must come before route for id (i.e. display category).
router.get("/category/create", category_controller.category_create_get);

// POST request for creating category.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update category.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update category.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all categorys.
router.get("/categories", category_controller.category_list);

/// location ROUTES ///

// GET request for creating a location. NOTE This must come before route that displays location (uses id).
router.get("/location/create", location_controller.location_create_get);

//POST request for creating location.
router.post("/location/create", location_controller.location_create_post);

// GET request to delete location.
router.get("/location/:id/delete", location_controller.location_delete_get);

// POST request to delete location.
router.post("/location/:id/delete", location_controller.location_delete_post);

// GET request to update location.
router.get("/location/:id/update", location_controller.location_update_get);

// POST request to update location.
router.post("/location/:id/update", location_controller.location_update_post);

// GET request for one location.
router.get("/location/:id", location_controller.location_detail);

// GET request for list of all location.
router.get("/locations", location_controller.location_list);

// GET request for creating a iteminstance. NOTE This must come before route that displays iteminstance (uses id).
router.get(
  "/iteminstance/create",
  item_instance_controller.iteminstance_create_get
);

// POST request for creating iteminstance.
router.post(
  "/iteminstance/create",
  item_instance_controller.iteminstance_create_post
);

// GET request to delete iteminstance.
router.get(
  "/iteminstance/:id/delete",
  item_instance_controller.iteminstance_delete_get
);

// POST request to delete iteminstance.
router.post(
  "/iteminstance/:id/delete",
  item_instance_controller.iteminstance_delete_post
);

// GET request to update iteminstance.
router.get(
  "/iteminstance/:id/update",
  item_instance_controller.iteminstance_update_get
);

// POST request to update iteminstance.
router.post(
  "/iteminstance/:id/update",
  item_instance_controller.iteminstance_update_post
);

// GET request for one iteminstance.
router.get("/iteminstance/:id", item_instance_controller.iteminstance_detail);

// GET request for list of all iteminstance.
router.get("/iteminstances", item_instance_controller.iteminstance_list);

module.exports = router;
