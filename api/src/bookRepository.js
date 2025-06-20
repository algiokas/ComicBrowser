import * as bookDatabase from '../src/bookDatabase.js';
import { readdir, statSync, readdirSync } from 'fs';
import path from 'path';

import 'dotenv/config';

const languages = ["Japanese", "English", "Chinese"]
const imageDirectory = process.env.BOOKS_IMAGE_DIR

export function getFileName (id, book) {
    return String(id).padStart(4, '0') + ' - ' + book.title
}

//Parse data from a folder with the naming scheme:
// (prefix) [group (artist)] Title (tag1) (tag2)...
//If any of the tags are in the [languages] array they get set as the book language instead of a tag
function folderToJSON(folderName, contents, fileStats) {
    let output = {}
    if (!folderName || !contents || contents.length < 1) {
        return
    }
    output.folderName = folderName
    if (folderName[0] == '(')
        output.prefix = folderName.substring(1, folderName.indexOf(')', 1))
    else
        output.prefix = ""

    let artistGroupStart = folderName.indexOf('[', 0)
    let artistGroupEnd = folderName.indexOf(']', artistGroupStart)
    let artistGroupString = folderName.substring(artistGroupStart + 1, artistGroupEnd)

    let artistStart = artistGroupString.indexOf('(')
    if (artistStart < 0) {
        output.artists = artistGroupString.split(',')
        output.artGroup = ""
    }
    else {
        output.artGroup = artistGroupString.substring(0, artistStart).trim()
        output.artists = artistGroupString.substring(artistStart + 1, artistGroupString.indexOf(')')).split(',').map(s => s.trim())
    }

    let titleStart = artistGroupEnd + 1
    let suffixRegex = /\([^)]*\)|\[[^\]]*\]|\{[^\]]*\}/g;
    let suffixItems = folderName.substring(titleStart).match(suffixRegex)
    if (suffixItems && suffixItems.length > 0) {
        let tagsTemp = []
        suffixItems.forEach((item) => {
            let itemValue = item.substring(1, item.length - 1)
            if (languages.includes(itemValue)) {
                output.language = itemValue
            } else {
                tagsTemp.push(itemValue.trim())
            }
        })
        output.tags = tagsTemp

        let suffixStart = folderName.indexOf(suffixItems[0]) - 1
        output.title = folderName.substring(titleStart, suffixStart).trim()

    }
    else {
        output.title = folderName.substring(titleStart).trim()
    }

    output.pageCount = contents.length
    output.coverIndex = 0
    output.pages = contents

    if (fileStats) {
        output.addedDate = fileStats.birthtime
    } else {
        output.addedDate = Date.now()
    }

    return output
}

export function importBooks (res, callback) {
    let count = 0;
    
    console.log(`Checking for books in Directory: ${imageDirectory}`)
    readdir(imageDirectory, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        bookData = []
        files.forEach((file) => {
            let json = getBookData(file)
            if (json && !json.error) {
                bookData.push(json)
            }
        })
        
        let dbrows = [];
        bookData.forEach((book) => {
            let addResult = bookDatabase.addBook(book)
            if (addResult) {
                if (addResult.lastInsertRowid) {
                    book.id = addResult.lastInsertRowid
                    dbrows.push(book)
                    count++
                }
                else if (addResult.existingRow) {
                    book.id = addResult.existingRow.id
                    dbrows.push(fillBook(addResult.existingRow))
                }
            } 
        })      
        callback(res, { books: dbrows, importCount: count })
    })
}

function getBookData(file) {
    let fullpath = path.join(imageDirectory, file);
    let fileStats = statSync(fullpath)
    if (fileStats.isDirectory()) {
        try {
            const files = readdirSync(fullpath);
            let folderContents = [];
            files.forEach((file) => {
                folderContents.push(file);
            });
            return folderToJSON(file, folderContents, fileStats);
        } catch (err) {
            return { error: err } 
        }
    }
}

//takes a row from the books table, converts some data from SQL format to JSON,
//and fills artists + tags with data from artist and tag tables
function fillBook(booksRow) {
    let book = booksRow
    if (booksRow.pages) {
        try {
            book.pages = JSON.parse(booksRow.pages)
            book.hiddenPages = JSON.parse(booksRow.hiddenPages)
            book.isFavorite = booksRow.isFavorite > 0
        } catch (e) {
            console.log(e);
        }
    }
    if (!booksRow.artists) book.artists = bookDatabase.getBookArtists(booksRow.id)
    if (!booksRow.tags) book.tags = bookDatabase.getBookTags(booksRow.id)

    return book;
}

export function getBooks () {
    console.log("/allbooks")
    let booksRow = bookDatabase.getBooks()
    if (!booksRow || booksRow.length < 1) {
        console.log("no books found")
        return booksRow
    }
    let books = []
    booksRow.forEach(row => {
        books.push(fillBook(row))
    });
    return books
}

export function getBookPage (id, pageNum) {
    let book = bookDatabase.getBookByID(id)
    if (book && book.pages) {
        //console.log(row.title + " page " + req.params.pageNum)
        let pageList = JSON.parse(book.pages)
        if (pageNum < pageList.length) {
            return path.join(book.folderName, pageList[pageNum]);
        } else {
            console.log('page number out of range')
        }
    } else {
        console.log(`unable to fetch data for book ID: ${id}`)
    }
}

export function getBook (id) {
    let book = bookDatabase.getBookByID(id)
    return fillBook(book)
}

export function updateBook(id, newBookData) {
    console.log("updating book with id " + id)
    let response = { success: false, errors: "" }
    let bookData = getBook(id);
    if (newBookData.title !== bookData.title) {
        bookDatabase.setTitle(id, newBookData.title)
    }
    if (newBookData.artGroup !== bookData.artGroup) {
        bookDatabase.setArtGroup(id, newBookData.artGroup)
    }
    if (newBookData.artists && bookData.artists) {
        let artistsToAdd = newBookData.artists.filter(t => !bookData.artists.includes(t))
        let artistsToRemove = bookData.artists.filter(t => !newBookData.artists.includes(t))

        if (artistsToAdd.length) {
            let addResult = bookDatabase.addArtists(id, artistsToAdd)
            if (addResult.length === artistsToAdd.length) {
                response.success = true;
            } else {
                response.errors = response.errors + "Adding artists failed"
            }
        } 
        if (artistsToRemove.length) {
            let removeResult = bookDatabase.removeArtists(id, artistsToRemove)
            if (removeResult.length === artistsToRemove.length) {
                response.success = true;
            } else {
                response.errors = response.errors + "Adding artists failed"
            }
        }
    }
    if (newBookData.tags && bookData.tags) {
        let tagsToAdd = newBookData.tags.filter(t => !bookData.tags.includes(t))
        let tagsToRemove = bookData.tags.filter(t => !newBookData.tags.includes(t))

        if (tagsToAdd.length) {
            let addResult = bookDatabase.addTags(id, tagsToAdd)
            if (addResult.length === tagsToAdd.length) {
                response.success = true;
            } else {
                response.errors = response.errors + "Adding tags failed"
            }
        } 
        if (tagsToRemove.length) {
            let removeResult = bookDatabase.removeTags(id, tagsToRemove)
            if (removeResult.length === tagsToRemove.length) {
                response.success = true;
            } else {
                response.errors = response.errors + "Adding tags failed"
            }
        }
    }
    if (newBookData.hiddenPages && bookData.hiddenPages) {
        if (JSON.stringify(newBookData.hiddenPages) !== JSON.stringify(bookData.hiddenPages)) {
            try {
                let updateResult = bookDatabase.setHiddenPages(id, newBookData.hiddenPages)
                if (updateResult) response.success = true
            } catch (err) {
                response.errors = response.errors + err.message
            }
        }
        
    }
    if (newBookData.isFavorite !== bookData.isFavorite) {
        try {
            let updateResult = bookDatabase.setFavoriteValue(id, newBookData.isFavorite)
            if (updateResult) response.success = true
        } catch (err) {
            response.errors = response.errors + err.message
        } 
    }
    if (response.errors) response.success = false
    response.book = getBook(id)
    return response
}

export function deleteBook(id) {
    return bookDatabase.deleteBook(id)
}

export function createCollection(createCollectionRequest) {
    return bookDatabase.createCollection(
        createCollectionRequest.name, 
        createCollectionRequest.books, 
        createCollectionRequest.coverBookId
    )
}

export function getCollections() {
    return bookDatabase.getAllCollections()
}