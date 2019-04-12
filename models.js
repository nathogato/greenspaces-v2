"use strict";

const mongoose = require("mongoose");


// this is our schema to represent comments on a park by a user
const commentSchema = mongoose.Schema({
  parkId: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// this is our schema to represent a visited park 
const visitedSchema = mongoose.Schema({
  parkId: { type: String, required: true },
  visited: { type: String, required: true },
  date: { type: Date, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// this is our schema to represent a favorited park 
const favoritedSchema = mongoose.Schema({
  parkId: { type: String, required: true },
  favorited: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});



// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
//const User = mongoose.model("User", userSchema);
const Visited = mongoose.model("Visited", visitedSchema);
const Favorited = mongoose.model("Favortied", favoritedSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { Visited, Favorited, Comment};
