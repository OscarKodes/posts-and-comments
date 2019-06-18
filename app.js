//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

// Tells express to use ejs files in the views folder
app.set('view engine', 'ejs');

// Tell express to serve up the public folder as a static resource
app.use(express.static(__dirname + '/public'));

// Tells express to use bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// Create new mongoDB database
mongoose.connect("mongodb://localhost:27017/postComDB", {useNewUrlParser: true, useFindAndModify: false});

// Create new schema for posts
const commentsSchema = {
  author: String,
  text: String
}

const postsSchema = {
  title: String,
  author: String,
  text: String,
  comments: [commentsSchema]
}


// Create new model for posts
const Comment = mongoose.model("Comment", commentsSchema);
const Post = mongoose.model("Post", postsSchema);

// Create some sample posts
const post1 = {
  title: "My favorite things",
  author: "Elmo",
  text: "Elmo loves his goldfish and his crayons too. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}

const post2 = {
  title: "Sunny Day",
  author: "Big Bird",
  text: "Sunny day, keeping the clouds away. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}

const post3 = {
  title: "Villain, have you heard these words?!",
  author: "All Might",
  text: "Go beyond! Plus Ultra! It's okay now because I'm here. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}

const samplePosts = [post1, post2, post3];

app.get("/", function(req, res){

  Post.find({}, function(err, foundPosts){
    if (foundPosts.length === 0) {
      Post.insertMany(samplePosts, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted sample posts.");
        }
        res.redirect("/");
      });
    }
    else {
      res.render("index", {posts: foundPosts});
    }
  });
});

app.post("/", function(req, res){

  const newPost = new Post ({
    title: req.body.title,
    author: req.body.author,
    text: req.body.text,
  });

  newPost.save();
  console.log("Post added.");

  res.redirect("/");
});


app.post("/delete", function(req, res){
  let postId = req.body.postId;

  Post.findByIdAndRemove(postId, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Post deleted.");
      res.redirect("/");
    }
  });
});


app.post("/:postId", function(req, res){

  let postId = req.params.postId;

  //check if we want to delete a comment
  if (req.body.commentId !== undefined) {
    let commentId = req.body.commentId;

    Post.findOneAndUpdate(
      {_id: postId},
      {$pull: {comments: {_id: commentId}}},
      {new: true},
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Comment deleted.");
        }
      }
    );
  };

  // find the post with the requested id
  Post.findById(postId, function(err, foundPost) {
    if (err) {
      console.log(err);
    } else {

      // check if we want to add a comment
      if (req.body.author !== undefined) {

        let newComment = new Comment ({
          author: req.body.author,
          text: req.body.text
        });

        foundPost.comments.push(newComment);
        foundPost.save();
        console.log("Comment added.");
      }

      res.render("postPage", {post: foundPost});
    };
  });
});





app.listen(3000, function() {
  console.log("Server has started on port 3000.");
});
