var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const bookRepo = require('../src/bookRepository');

const dataDirectory = path.join(__dirname, '../data');
const imageDirectory = path.join(__dirname, '../../../Images');
const booksDirectory = path.join(dataDirectory, "books")
const slideshowDirectory = path.join(dataDirectory, 'slideshows')
const slideshowFileBaseName = "ss_"

function getErrorObject(msg, err = null) {
  console.log(msg)
  return {
    success: false,
    message: msg,
    error: err
  }
}

function deleteAllItems(dir) {
  if (fs.statSync(dir).isDirectory()) {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.log('readdir error')
        console.log(err)
      }
      for (const f of files) {
        fs.unlink(path.join(dir, f), err => {
          if (err) console.error(err)
        });
      }
    })
  }
}

router.get('/', function (req, res, next) {
  res.send("Comic Browser API Root");
});

router.get('/page/:bookId/:pageNum', function (req, res, next) {
  let fpath = bookRepo.getBookPage(req.params.bookId, req.params.pageNum);
  if (fpath) res.sendFile(fpath, { root: imageDirectory });
  else {
    res.sendStatus(404).end();
  }
});

router.get('/allbooks', function (req, res, next) {
  let books = bookRepo.getBooks()
  res.json(books)
});

router.get('/importbooks', function (req, res, next) {
  bookRepo.importBooks(res, (res, importResult) => {

    console.log("imported " + importResult.importCount + " books")
    res.json(importResult)
  })
});

router.post('/updatebook/:bookId', function (req, res, next) {
  if (!req.body) console.log("invalid book data")
  if (req.body.id.toString() === req.params.bookId) {
    res.json(bookRepo.updateBook(req.params.bookId, req.body))
  }
})

router.delete('/deletebook/:bookId', function (req, res) {
  console.log('delete book id: ' + req.params.bookId)
  res.json(bookRepo.deleteBook(req.params.bookId))
})

router.post('/saveslideshow', function (req, res, next) {
});

module.exports = router;


