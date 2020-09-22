// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
// 'ejs' set as the 'view engine' for our express-generated app. This assumes a views directory containing a list.ejs page.
app.set('view engine', 'ejs');

// express app can now use the body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

// We accumulate all our static files in the "public" folder and ask express to serve them.
app.use(express.static("public"));

//connecting to our MongoDB started on Port: 27017
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

// List Default Items
const item1 = new Item({
  name: "Welcome to your To-Do list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  const day = date.getDay();
  Item.find({}, function(err, items){
    if (err) {
      console.log(err);
    } else if (items.length === 0) {
      Item.insertMany([item1, item2, item3], function(err, items){
        if (err){
          console.log(err);
        } else {
          console.log("Successfully Added the Items");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", {listTitle: day, newTasks: items});
    }
  });
});

// Express allows the users to create Dynamic Routes (OP)
app.get("/:customListName", function(req, res){
  // Using lodash to convert to Upper Case
  const customListName = _.capitalize(req.params.customListName);

  // findOne() method does not return an array like find()
  List.findOne({name: customListName}, function(err, foundList){
    if (err) {
      console.log(err);
    } else {
      if (!foundList){
        // So, we create a new List.
        const customList = new List({
          name: customListName,
          items: [item1, item2, item3]
        });
        customList.save();
        foundList = customList;
      }
      res.render("list", {listTitle: foundList.name, newTasks: foundList.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.post("/", function(req, res) {
  const job = req.body.task;
  const list = req.body.list;
  const newtask = new Item({
    name: job
  });
  if (list === date.getDay()) {
    newtask.save();
    res.redirect("/");
  } else {
    List.findOne({name: list}, function(err, foundList){
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(newtask);
        foundList.save();
        res.redirect("/" + list);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === date.getDay()) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Item with _id = "+ checkedItemId + "is deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server is running on Port 3000");
});
