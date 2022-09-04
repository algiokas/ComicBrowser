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

router.get('/', function(req, res, next) {
  res.send("Sample API Response");
});

router.get('/allbooks', function(req, res, next) {
  fs.readdir(booksDirectory, function(err, files) {
    let books = [];
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach((file) => {
      let fullpath = path.join(booksDirectory, file)
      if (!fs.statSync(fullpath).isDirectory()) {
        let rawData = fs.readFileSync(fullpath);
        if (rawData) {
          var json = JSON.parse(rawData);
          books.push(json);
        }
      }
    })
    console.log(`returned ${books.length} books`)
    res.json(books);
  }) 
});

router.get('/importbooks', function(req, res, next) {
  let booksDirItems = fs.readdirSync(booksDirectory)
  let existingBooks = booksDirItems.map((str) => {

  })
  fs.readdir(imageDirectory, function(err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    let importCount = 0;
    files.forEach((file) => {
      let fullpath = path.join(imageDirectory, file)
      if (fs.statSync(fullpath).isDirectory())
      {
        let index = importCount + 1     
        let folderContents = []
        fs.readdir(fullpath, function(err, files) {
          if (err) {
            return console.log('Unable to scan directory: ' + err);
          }
          files.forEach((file) => {
            folderContents.push(file);
          })
          let json = bookRepo.folderToJSON(file, folderContents, index)
          if (json && json.title)
          {
            let fname = bookRepo.getFileName(index, json)
            let fpath = path.join(booksDirectory, fname)
            let fdata = JSON.stringify(json)
            fs.writeFileSync(fpath, fdata)
          }
        })
        importCount++
      }   
    })
    res.send(`<p>Import Complete, imported ${importCount} books`);
  })
  
});

router.post('/updatebook/:bookId', function(req, res, next) {
  var book = req.body;
  fName = bookRepo.getFileName(book.id, book)
  let fullPath = path.join(booksDirectory, fName)
  fs.readFile(fullPath, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      let errMsg = 'Unable to read file: ' + err
      console.log(errMsg)
      res.json({
        success: false,
        error: errMsg
      })
    } else {
      if (data) {
        var json = JSON.parse(rawData);
        if (json) {
          let updatedBook = Object.assign(json, book)
          await fs.writeFile(fullPath, JSON.stringify(updatedBook))
          res.json({
            success: true,
            fileName: fName,
            book: updatedBook
          })
        } else {
          let errMsg = 'JSON parse failed'
          console.log(errMsg)
          res.json({
            success: false,
            error: errMsg
          })
        }
      }
    }
  })
})

router.post('/saveslideshow', function(req, res, next) {
  let fileIndex = 01
  let fname = slideshowFileBaseName + fileIndex

  fs.readdir(slideshowDirectory, function(err, files) {
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