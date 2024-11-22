var express = require('express');
var router = express.Router();
const bookRepo = require('../src/bookRepository')

router.get('/', function (req, res, next) {
    let books = bookRepo.getBooks()
    res.json(books)
});

router.get('/import', function (req, res, next) {
    bookRepo.importBooks(res, (res, importResult) => {

        console.log("imported " + importResult.importCount + " books")
        res.json(importResult)
    })
});


router.get('/page/:bookId/:pageNum', function (req, res, next) {
    let fpath = bookRepo.getBookPage(req.params.bookId, req.params.pageNum);
    if (fpath) res.sendFile(fpath, { root: process.env.BOOKS_IMAGE_DIR });
    else {
        res.sendStatus(404).end();
    }
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

router.get('/collections/all', function (req, res) {
    console.log('get all collections')
})

router.put('/collections/create', function (req, res) {
    console.log('new collection: ' + req.body.name)

})

router.post('/collections/update/:collectionId', function (req, res) {
    console.log('update collection: ' + req.params.collectionId)

})

router.delete('/collections/delete/:collectionId', function (req, res) {
    console.log('delete collection: ' + req.params.collectionId)
})

module.exports = router