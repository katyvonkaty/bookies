const express = require('express');
const ejs = require('ejs');
require('dotenv').config();
const bodyParser = require('body-parser');
const goodreads = require('goodreads-api-node');
const app = express();

// Goodreads API - NodeJS
const myCredentials = {
    key: process.env.GOODREADS_KEY,
    secret: process.env.GOODREADS_SECRET
};
const gr = goodreads(myCredentials);

// Initialising Express
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get("/", function(req,res) {
  res.render("index")
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


app.listen(3000);
console.log('Listening on 3000');
