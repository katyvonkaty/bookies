const express = require('express');
const ejs = require('ejs');
require('dotenv').config();
const bodyParser = require('body-parser');
const goodreads = require('goodreads-api-node');
var flash = require('connect-flash');
var session = require('express-session');

const app = require("https-localhost")();

// Goodreads API - NodeJS
const myCredentials = {
    key: process.env.GOODREADS_KEY,
    secret: process.env.GOODREADS_SECRET
};

const callbackURL = "https://localhost:8080/goodreads"
const gr = goodreads(myCredentials);


gr.initOAuth(callbackURL);
app.use(flash())

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({ cookie: { maxAge: 60000 },
                  secret: 'woot',
                  resave: false,
                  saveUninitialized: false}));

app.use(bodyParser.json());

app.get("/", function(req,res) {
  res.render("index")
})

app.get("/authenticate", function (req, res) {
    gr.getRequestToken()
        .then(url => {
          console.log(url);
            res.redirect(url);
        }).catch(function () {
            console.log("Goodreads Authentication Rejected");
        });
});

app.get("/goodreads", function (req, res) {
    gr.getAccessToken()
        .then(url => {
            var userinfo = gr.getCurrentUserInfo();
            userinfo.then(function (result) {
              req.flash("userid", result.user.id)
              res.redirect("/");
            });
        }).catch(function () {
            console.log("Goodreads User Info Rejected");
        });
});


app.get('/shelves', function (req, res) {
    let userid= req.flash("userid")
    var usersshelves = gr.getUsersShelves(userid);
    usersshelves.then(function (result) {
        var usershelf = result.user_shelf;
    }).catch(function () {
        console.log("Goodreads Get Shelves Rejected");
        console.log(result);
    });
});

app.get('/owned-books', function (req, res) {
  let userid= req.flash("userid")

    var usersbooks = gr.getOwnedBooks({
        userID: userid,
        page: 1
    });
    usersbooks.then(function (result) {
      console.log(result);
      var userbooklist = result.owned_books.owned_book;
      res.render("pages/owned-books", {
      userbooklist: userbooklist
      })
    }).catch(function () {
        console.log("Goodreads Get Owned Books Rejected");
    });
});

//get user Info
app.get("/user-info", function(req,res){
  let userid = req.flash("userid")

  var userinfo = gr.getUserInfo({
    userID: userid,
    page:1
  })
  userinfo.then(function(result){
    console.log(result);
  }).catch(function() {
    console.log("user info error");
  })
})



// Search Route
app.post('/search', function (req, res) {
    var bookquery = req.body.book;
    var booklist = gr.searchBooks({
        q: bookquery,
        page: 1,
        field: 'title'
    });
    booklist.then(function (result) {
        var bookresult = result.search.results.work;
        console.log(bookresult);
        res.render('pages/search-results', {
            bookresult: bookresult
        });
    }).catch(function () {
        console.log("Goodreads Search Books Rejected");
    });
});



// Single Book Route
app.get('/book', function (req, res) {
    var bookid = gr.showBook(req.query.id);
    bookid.then(function (result) {
        var bookdetails = result.book;
        console.log(bookdetails);
        res.render('pages/book', {
            bookdetails: bookdetails
        });
    }).catch(function () {
            console.log("Book Search Rejected");
        });
});


app.listen(8080);
console.log('Listening on 8080');
