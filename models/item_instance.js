const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemInstanceSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true }, // reference to the associated item
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true }, // reference to the associated location
});

// Virtual for iteminstance's URL
ItemInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/iteminstance/${this._id}`;
});

// Export model
module.exports = mongoose.model("ItemInstance", ItemInstanceSchema);
