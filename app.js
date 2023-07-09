const express = require("express");
const app = express();

const mongoose = require("mongoose");
const Item = require(__dirname + "/Item");
const List = require(__dirname + "/List");

const _ = require("lodash");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const defaultItem1 = new Item({
  name: "Welcome to your new To-Do List",
});

const defaultItem2 = new Item({
  name: "Use the '+' button to add new items",
});

const defaultItem3 = new Item({
  name: "Hit the checkbox to delete an item",
});

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

app.get("/", function (req, res) {
  async function renderList() {
    let currentItems = await Item.find();

    if (currentItems.length === 0) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { header: "Today", list: currentItems });
    }
  }

  renderList().catch((err) => {
    console.log(err);
  });
});

app.get("/:listName", function (req, res) {
  const listName = _.capitalize(req.params.listName);

  async function findList(listTitle) {
    const foundList = await List.findOne({ name: listTitle });

    if (!foundList) {
      const newList = new List({
        name: listName,
        items: defaultItems,
      });

      await newList.save();

      res.redirect("/" + listName);
    } else {
      res.render("list", { header: foundList.name, list: foundList.items });
    }
  }

  findList(listName).catch((err) => {
    console.log(err);
  });
});

app.post("/", function (req, res) {
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {
    const newItem = new Item({
      name: req.body.newItem,
    });

    async function saveNewItem() {
      await newItem.save();
    }

    saveNewItem().catch((err) => {
      console.log(err);
    });

    res.redirect("/");
  } else {
    async function updateList() {
      const listToUpdate = await List.findOne({ name: listTitle });
      listToUpdate.items.push({ name: req.body.newItem });
      await listToUpdate.save();

      res.redirect("/" + listTitle);
    }

    updateList().catch((err) => {
      console.log(err);
    });
  }
});

app.post("/delete", function (req, res) {
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {
    async function deleteItem() {
      await Item.deleteOne({ _id: req.body.itemID });
    }

    deleteItem().catch((err) => {
      console.log(err);
    });

    res.redirect("/");
  } else {
    async function updateItemsArray() {
      await List.updateOne(
        { name: listTitle },
        { $pull: { items: { _id: req.body.itemID } } }
      );
    }

    updateItemsArray().catch((err) => {
      console.log(err);
    });

    res.redirect("/" + listTitle);
  }
});

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server is running.");
});
