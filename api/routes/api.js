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
          try {
            var json = JSON.parse(rawData);
            books.push(json);
          } catch(err) {
            console.log('Invalid Json in file: ' + file)
          }
        }
      }
    })
    console.log(`returned ${books.length} books`)
    res.json(books);
  }) 
});

router.post('/importbooks', function(req, res, next) {
  console.log('Import Books')
  if (req.body && req.body.deleteExistingItems) {
    fs.readdir(booksDirectory, (err, files) => {
      if (err) {
        console.log('readdir error')
        console.log(err)
      }
      for (const f of files) {
        fs.unlink(path.join(booksDirectory, f), err => {
          if (err) console.error(err)
        });
      }
    })
  }

  fs.readdir(imageDirectory, function(err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    let importCount = 0;
    let books = []
    files.forEach((file) => {
      let fullpath = path.join(imageDirectory, file)
      if (fs.statSync(fullpath).isDirectory())
      {
        let index = importCount + 1     
        try {
          const files = fs.readdirSync(fullpath)
          let folderContents = []
          files.forEach((file) => {
            folderContents.push(file);
          })
          let json = bookRepo.folderToJSON(file, folderContents, index)
          if (!json.title) console.log(`no title: ${file}`)
          if (json && json.title)
          {
            books.push(json)
            let fname = bookRepo.getFileName(index, json)
            let fpath = path.join(booksDirectory, fname)
            let fdata = JSON.stringify(json)
            fs.writeFileSync(fpath, fdata)
          }
        } catch(err) {
          console.log(err)
        }
        importCount++
      }   
    })
    console.log(books.length)
    res.json({ 
      importCount: importCount,
      books: books
    });
  })
  
});

router.post('/updatebook/:bookId', function(req, res, next) {
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