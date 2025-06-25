import { Router } from 'express';
import { createCollection, deleteBook, getBookPage, getBooks, getCollections, importBooks, updateBook } from '../src/bookRepository.js';
var router = Router();

router.get('/', function (req, res, next) {
    let books = getBooks()
    res.json(books)
});

router.get('/import', function (req, res, next) {
    importBooks(res, (res, importResult) => {
        console.log("imported " + importResult.importCount + " books")
        res.json(importResult)
    })
});


router.get('/:bookId/page/:pageNum', function (req, res, next) {
    let fpath = getBookPage(req.params.bookId, req.params.pageNum);
    if (fpath) res.sendFile(fpath, { root: process.env.BOOKS_IMAGE_DIR });
    else {
        res.sendStatus(404).end();
    }
});


router.post('/:bookId/update', function (req, res, next) {
    if (!req.body) {
        console.log("invalid book data")
    } 
    if (req.body.id.toString() === req.params.bookId) {
        res.json(updateBook(req.params.bookId, req.body))
    }
})

router.delete('/:bookId', function (req, res) {
    console.log('delete book id: ' + req.params.bookId)
    res.json(deleteBook(req.params.bookId))
})

router.get('/collections/all', function (req, res) {
    console.log('get all collections')
    res.json(getCollections())
})

router.post('/collections/create', function (req, res) {
    console.log('new collection: ' + req.body.name)
    res.json(createCollection(req.body))
})

router.post('/collections/update/:collectionId', function (req, res) {
    console.log('update collection: ' + req.params.collectionId)

})

router.delete('/collections/delete/:collectionId', function (req, res) {
    console.log('delete collection: ' + req.params.collectionId)
})

export default router