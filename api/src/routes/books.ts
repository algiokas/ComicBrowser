import { Router } from 'express';
import { getBooks, importBooks, getBookPage, updateBook, deleteBook, getCollections, createCollection } from '../bookRepository';
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
    const bookId = Number(req.params.bookId)
    if (isNaN(bookId)) {
        res.status(500).send(`Internal Server Error: parameter bookId must be a number - provided value: ${bookId}`)
        return
    }

    const pageNum = Number(req.params.pageNum)
    if (isNaN(pageNum)) {
        res.status(500).send(`Internal Server Error: parameter pageNum must be a number - provided value: ${pageNum}`)
        return
    }

    let fpath = getBookPage(bookId, pageNum);
    if (fpath) res.sendFile(fpath, { root: process.env.BOOKS_IMAGE_DIR });
    else {
        res.sendStatus(404).end();
    }
});


router.post('/:bookId/update', function (req, res, next) {
    const bookId = Number(req.params.bookId)
    if (isNaN(bookId)) {
        res.status(500).send(`Internal Server Error: parameter bookId must be a number - provided value: ${bookId}`)
        return
    }

    if (!req.body) {
        console.log("invalid book data")
    } 
    if (req.body.id.toString() === bookId) {
        res.json(updateBook(bookId, req.body))
    } else {
        res.status(500).send(`Internal Server Error: mismatch between bookId param and request body book ID - ${bookId} vs ${req.body.id}`)
    }
})

router.delete('/:bookId', function (req, res) {
    const bookId = Number(req.params.bookId)
    if (isNaN(bookId)) {
        res.status(500).send(`Internal Server Error: parameter bookId must be a number - provided value: ${bookId}`)
        return
    }

    console.log('delete book id: ' + bookId)
    res.json(deleteBook(bookId))
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
    //TODO
    console.log('NOT IMPLEMENTED - update collection: ' + req.params.collectionId)
})

router.delete('/collections/delete/:collectionId', function (req, res) {
    //TODO
    console.log('NOT IMPLEMENTED - delete collection: ' + req.params.collectionId)
})

export default router