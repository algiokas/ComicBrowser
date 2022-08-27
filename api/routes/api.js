var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const jsonRepo = require('../src/jsonRepo');

const dataDirectory = path.join(__dirname, '../data');
const imageDirectory = path.join(__dirname, '../../../Images');
const booksDirectory = path.join(dataDirectory, "books")

router.get('/', function(req, res, next) {
  res.send("Sample API Response - " + imageDirectory);
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
  fs.readdir(imageDirectory, function(err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    let importCount = 0;
    files.forEach((file) => {
      let fullpath = path.join(imageDirectory, file)
      if (fs.statSync(fullpath).isDirectory())
      {        
        let folderContents = []
        fs.readdir(fullpath, function(err, files) {
          if (err) {
            return console.log('Unable to scan directory: ' + err);
          }
          files.forEach((file) => {
            folderContents.push(file);
          })
          let json = jsonRepo.folderToJSON(file, folderContents)
          if (json && json.title)
          {
            let fpath = path.join(booksDirectory, json.title)
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

module.exports = router;