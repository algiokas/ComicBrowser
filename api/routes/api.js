var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const bookRepo = require('../src/bookRepository');
const db = require('../src/database')

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
  res.send("Hentai Browser API Root");
});

router.get('/page/:bookId/:pageNum', function (req, res, next) {
  bookRepo.getBookData(req.params.bookId, req.params.pageNum, res, (res, folderName, imgFile) => {
    let fpath = path.join(folderName, imgFile)
    res.sendFile(fpath, { root: imageDirectory })
  })
});

router.get('/allbooks', function (req, res, next) {
  bookRepo.getBooks((bookData) => {
    res.json(bookData)
  })
});

router.get('/importbooks', function (req, res, next) {
  bookRepo.importBooks(res, (res, importResult) => {
    console.log("imported books")
    res.json(importResult.books)
  })
});

router.post('/updatebook/:bookId', function (req, res, next) {
  var book = req.body;
  fName = bookRepo.getFileName(book.id, book)
  let fullPath = path.join(booksDirectory, fName)
  fs.readFile(fullPath, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      res.json(getErrorObject('File Read Error', err))
    } else {
      if (data) {
        var json = JSON.parse(data);
        if (json) {
          let updatedBook = Object.assign(json, book)
          fs.writeFile(fullPath, JSON.stringify(updatedBook), (err1) => {
            if (err1) {
              res.json(getErrorObject('File Write Error', err1))
            }
          })
          res.json({
            success: true,
            fileName: fName,
            book: updatedBook
          })
        } else {
          res.json(getErrorObject('JSON parse failed'))
        }
      }
    }
  })
})

router.post('/saveslideshow', function (req, res, next) {
  let fileIndex = 01
  let fname = slideshowFileBaseName + fileIndex

  fs.readdir(slideshowDirectory, function (err, files) {
    while (files.includes(fname)) {
      fileIndex++;
      fname = slideshowFileBaseName + fileIndex
    }

    let fpath = path.join(slideshowDirectory, fname)

    if (req.body && req.body.ids) {
      fs.writeFileSync(fpath, JSON.stringify(req.body))

      res.json({
        Status: "success",
        FileName: fname,
        Size: req.body.ids.length
      })
    }
    else {
      res.json({
        Status: "Fail",
        Detail: "Invalid Request"
      })
    }
  })
});

module.exports = router;


