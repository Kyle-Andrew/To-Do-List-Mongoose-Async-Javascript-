const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

module.exports = new mongoose.model("List", listSchema);
