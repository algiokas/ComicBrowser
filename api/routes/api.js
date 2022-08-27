var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');

const dataDirectory = path.join(__dirname, '../data');

router.get('/', function(req, res, next) {
  res.send("Sample API Response");
});

router.get('/allbooks', function(req, res, next) {
  let books = [];
  let booksDir = path.join(dataDirectory, "books");
  fs.readdir(booksDir, function(err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach((file) => {
      let fullpath = path.join(booksDir, file)
      let rawData = fs.readFileSync(fullpath);
      if (rawData) {
        var json = JSON.parse(rawData);
        books.push(json);
      }
    })
    res.json(books);
  })
});

module.exports = router;