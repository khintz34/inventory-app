#! /usr/bin/env node

console.log(
  "This script populates some test inventory items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/inventory?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");
var Location = require("./models/location");
var ItemInstance = require("./models/item_instance");

var mongoose = require("mongoose");
mongoose.set("strictQuery", false);
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const items = [];
const categories = [];
const locations = [];
const iteminstances = [];

function itemCreate(name, description, category, price, cb) {
  console.log(name, description, category, price);
  itemdetail = {
    name: name,
    description: description,
    category: category,
    price: price,
  };

  var item = new Item(itemdetail);

  item.save(function (err) {
    if (err) {
      console.log(err);
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function locationCreate(name, cb) {
  console.log("creating Location: " + name);
  location = new Location({ name: name });

  location.save(function (err) {
    if (err) {
      console.log("error" + name);
      cb(err, null);
      return;
    }
    console.log("New Location: " + location);
    locations.push(location);
    cb(null, location);
  });
}

function categoryCreate(name, description, cb) {
  categorydetail = {
    name: name,
    description: description,
  };

  var category = new Category(categorydetail);
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemInstanceCreate(item, location, cb) {
  iteminstancedetail = {
    item: item,
    location: location,
  };

  const iteminstance = new ItemInstance(iteminstancedetail);
  iteminstance.save(function (err) {
    if (err) {
      console.log("ERROR CREATING ItemInstance: " + iteminstance);
      cb(err, null);
      return;
    }
    console.log("New ItemInstance: " + iteminstance);
    iteminstances.push(iteminstance);
    cb(null, Item);
  });
}

function createLocationsCategories(cb) {
  async.series(
    [
      function (callback) {
        locationCreate("Manchester", callback);
      },
      function (callback) {
        locationCreate("New York", callback);
      },
      function (callback) {
        locationCreate("Barcelona", callback);
      },
      function (callback) {
        locationCreate("Paris", callback);
      },
      function (callback) {
        locationCreate("Los Angeles", callback);
      },
      function (callback) {
        categoryCreate("Boots", "Soccer/Football cleats/boots.", callback);
      },
      function (callback) {
        categoryCreate("Jerseys", "Soccer/Football jerseys/shirts. ", callback);
      },
      function (callback) {
        categoryCreate("Apparell", "Soccer/Football apparell", callback);
      },
    ],
    //optional cb
    cb
  );
}

function createItems(cb) {
  console.log("createItems function");
  async.series(
    [
      function (callback) {
        itemCreate(
          "Adidas Copa Mundial",
          "The best kangaroo leather boots on the market for the washed up players",
          categories[0],
          "89.99",
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Adidas Predator",
          "The OG Adidas Predators back in stock from the Beckham days",
          categories[0],
          109.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Nike Vapor",
          "The fastest boot on the pitch.",
          categories[0],
          99.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Puma Duster",
          "Who is wearing Pumas??",
          categories[0],
          14.99,
          callback
        );
      },
      function (callback) {
        itemCreate("Messi - PSG", "The GOAT", categories[1], 100.99, callback);
      },
      function (callback) {
        itemCreate(
          "Messi - Argentina",
          "The GOAT with WC Winners Patch",
          categories[1],
          111.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Ronaldo - Al Nassar",
          "The Sellout - how many PKs will he score?",
          categories[1],
          55.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Casemiro - Manchester United",
          "Will he bring the glory days back to UTD?",
          categories[1],
          79.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Hat - Manchester United",
          "Sretford End Supporter's Hat",
          categories[2],
          19.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Gloves - Addidas",
          "For cold rainy nights at stoke",
          categories[2],
          20.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "3/4 Pants - Nike",
          "Useful but ugly",
          categories[2],
          29.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Waterbottle - LAFC",
          "Support the black and gold while staying hydrated",
          categories[1],
          79.99,
          callback
        );
      },
    ],
    // optional cb
    cb
  );
}

function createItemInstances(cb) {
  async.parallel(
    [
      function (callback) {
        itemInstanceCreate(items[0], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[0], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[1], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[1], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[2], locations[3], callback);
      },
      function (callback) {
        itemInstanceCreate(items[3], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[3], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[4], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[4], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[5], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[5], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[6], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[7], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[7], locations[3], callback);
      },
      function (callback) {
        itemInstanceCreate(items[7], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[8], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[8], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[8], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[9], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[9], locations[3], callback);
      },
      function (callback) {
        itemInstanceCreate(items[10], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[10], locations[1], callback);
      },
      function (callback) {
        itemInstanceCreate(items[10], locations[0], callback);
      },
      function (callback) {
        itemInstanceCreate(items[11], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[11], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[11], locations[4], callback);
      },
      function (callback) {
        itemInstanceCreate(items[12], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[12], locations[2], callback);
      },
      function (callback) {
        itemInstanceCreate(items[12], locations[4], callback);
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [createLocationsCategories, createItems, createItemInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("ItemsInstances: " + iteminstance);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);

// node populatedb mongodb+srv://admin:Aood%40034@cluster0.fo3x4lv.mongodb.net/inventory?retryWrites=true
