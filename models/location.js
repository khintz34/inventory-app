const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 25 },
});

// Virtual for book's URL
LocationSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/location/${this._id}`;
});

// Export model
module.exports = mongoose.model("Location", LocationSchema);
