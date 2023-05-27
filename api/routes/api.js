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

function getBookData(id) {
  let sql = "SELECT * FROM books WHERE id = " + id
  db.get(sql, (err, row) => {
    if (err) {
      console.log(err)
    }
    return row
  })
}

router.get('/', function (req, res, next) {
  res.send("Hentai Browser API Root");
});

router.get('/page/:bookId/:pageNum', function (req, res, next) {
  let sql = "SELECT * FROM books WHERE id = ?"
  var params = [ req.params.bookId ]
  db.get(sql, params, (err, row) => {
    if (err) {
      console.log(err)
    }
    if (row && row.pages) {
      //console.log(row.title + " page " + req.params.pageNum)
      let pageList = JSON.parse(row.pages)
      if (req.params.pageNum < pageList.length) {
        let fpath = path.join(row.folderName, pageList[req.params.pageNum])
        res.sendFile(fpath, { root: imageDirectory })
      } else {
        console.log('page number out of range')
      }
    } else {
      console.log(`unable to fetch data for book ID: ${req.params.bookId}`)
    }
  })
});

router.get('/allbooks', function (req, res, next) {
  console.log("/allbooks")
  var params = []
  db.all('SELECT * FROM books', params, function (err, rows) {
    if (err) {
      console.log(err)
    }
    rows.forEach(row => {
      if (row.pages) {
        try {
          pageArray = JSON.parse(row.pages);
          row.pages = pageArray
        } catch (e) {
          console.err(e);
        }
      }
      //TEMP
      if (!row.artists) row.artists = []
      if (!row.tags) row.tags = []
    });
    res.json(rows)
  })
});

async function importFiles(files, callback) {
  let importCount = 0;
  let books = [];
  db.serialize(function () {
    files.forEach(async function(file) {
      let importResult = await importFile(file)
      if (importResult && importResult.success && importResult.book) {
        importCount++
        books.push(importResult.book)
      }
    })
  })
  console.log(`imported ${importCount} books`);
  return { importCount, books };
}

async function importFile(file, callback) {
  let fullpath = path.join(imageDirectory, file);
  if (fs.statSync(fullpath).isDirectory()) {
    try {
      const files = fs.readdirSync(fullpath);
      let folderContents = [];
      files.forEach((file) => {
        folderContents.push(file);
      });
      let json = bookRepo.folderToJSON(file, folderContents);
      bookRepo.importBook(json)
        .then((value) => {
          if (value && value.success) {
            json.id = value.id
            return { success: true, book: json, error: null }
          }
          else if (value) {
            if (!value.id) {
              console.log("book + " + json.title + "ID invalid")
            }
          }
        });
    } catch (err) {
      console.log(err);
      return { success: false, error: err }
    }
  }
}

router.get('/importbooks', function (req, res, next) {
  console.log('Import Books to DB')
  fs.readdir(imageDirectory, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    importFiles(files)
      .then((result) => {
        console.log("imported: " + result.importCount + " books")
        res.json(result)
      })
      .catch((reason) => console.log("import failed"));    
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

router.get('/filebooks', function (req, res, next) {
  fs.readdir(booksDirectory, function (err, files) {
    let books = [];
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach((file) => {
      let fullpath = path.join(booksDirectory, file)
      let stats = fs.statSync(fullpath)
      console.log(file + 'age: ' + stats.birthtime)
      if (!stats.isDirectory()) {
        let rawData = fs.readFileSync(fullpath);
        if (rawData) {
          try {
            var json = JSON.parse(rawData);
            books.push(json);
          } catch (err) {
            console.log('Invalid Json in file: ' + file)
          }
        }
      }
    })
    console.log(`returned ${books.length} books`)
    res.json(books);
  })
});

router.post('/fileimport', function (req, res, next) {
  console.log('Import Books')
  if (req.body && req.body.deleteExistingItems) {
    deleteAllItems(booksDirectory)
  } else {

  }

  fs.readdir(imageDirectory, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    let importCount = 0;
    let index = 0;
    let books = []
    files.forEach((file) => {
      let fullpath = path.join(imageDirectory, file)
      if (fs.statSync(fullpath).isDirectory()) {
        try {
          const files = fs.readdirSync(fullpath)
          let folderContents = []
          files.forEach((file) => {
            folderContents.push(file);
          })
          let json = bookRepo.folderToJSON(file, folderContents, index)
          if (!json.title) console.log(`no title: ${file}`)
          if (json && json.title) {
            books.push(json)
            let fname = bookRepo.getFileName(index, json)
            let fpath = path.join(booksDirectory, fname)
            if (req.body.deleteExistingItems || !fs.existsSync(fpath)) {
              let fdata = JSON.stringify(json)
              fs.writeFileSync(fpath, fdata)
              importCount++
            } else {
              console.log(`file ${fname} already exists, skipping`)
            }
          }
        } catch (err) {
          console.log(err)
        }
        index++
      }
    })
    console.log(`imported ${importCount} books`)
    res.json({
      importCount: importCount,
      books: books
    });
  })

});

module.exports = router;


