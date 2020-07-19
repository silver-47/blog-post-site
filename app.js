require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure) next();
  else res.redirect('https://' + req.headers.host + req.url);
});

mongoose.connect(
  "mongodb+srv://"
    +process.env.DB_USER
    +":"
    +process.env.DB_PASS
    +"@blog-post-site.wahsq.mongodb.net/"
    +process.env.DB_NAME
    +"?retryWrites=true&w=majority",
  {useNewUrlParser: true, useUnifiedTopology: true}
);

const Post = mongoose.model("Post", {
  title: String,
  body: String
});

const Starter = mongoose.model("Starter", {
  title: String,
  content: String
});

app.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    Starter.findOne({title: 'home'}, (err, starter) => {
      res.render('home', {homeStartingContent: starter.content, posts});
    });
  });
} );

app.get('/about', (req, res) => {
  Starter.findOne({title: 'about'}, (err, starter) => {
    res.render('about', {aboutContent: starter.content});
  });
} );

app.get('/contact', (req, res) => {
  Starter.findOne({title: 'contact'}, (err, starter) => {
    res.render('contact', {contactContent: starter.content});
  });
} );

app.get('/compose', (req, res) => {
  res.render('compose');
} );

app.post('/compose', (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    body: req.body.postBody
  });
  post.save((err) => {if (!err) res.redirect('/');});
} );

app.get('/posts/:id', (req,res) => {
  Post.findOne({_id : req.params.id}, (err, post) => {
    res.render('post', {
      id: post._id,
      title: post.title,
      body: post.body
    });
  });
});

app.get('/edit/:id', (req,res) => {
  Post.findOne({_id : req.params.id}, (err, post) => {
    res.render('edit', {
      id: post._id,
      title: post.title,
      body: post.body
    });
  });
});

app.post('/edit/:id', (req,res) => {
  Post.updateOne({_id: req.params.id}, {
    title: req.body.postTitle,
    body: req.body.postBody
  }, (err) => {if (!err) res.redirect('/posts/' + req.params.id);});
});

app.get('/delete/:id', (req,res) => {
  Post.deleteOne({_id: req.params.id}, (err) => {
    if (!err) res.redirect('/');
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started Successfully...");
});
