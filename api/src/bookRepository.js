const languages = ["Japanese", "English", "Chinese", "Translated"]
const db = require('../src/database')
const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, '../data');
const imageDirectory = path.join(__dirname, '../../../Images');
const booksDirectory = path.join(dataDirectory, "books")
const slideshowDirectory = path.join(dataDirectory, 'slideshows')
const slideshowFileBaseName = "ss_"

exports.getFileName = function (id, book) {
    return String(id).padStart(4, '0') + ' - ' + book.title
}

//Parse data from a 
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
        output.artists = artistGroupString.substring(artistStart + 1, artistGroupString.indexOf(')')).split(',')
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
                tagsTemp.push(itemValue)
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

exports.importBooks = function (res, callback) {
    let count = 0;
    
    fs.readdir(imageDirectory, function (err, files) {
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
            let addResult = db.addBook(book)
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
    let fileStats = fs.statSync(fullpath)
    if (fileStats.isDirectory()) {
        try {
            const files = fs.readdirSync(fullpath);
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
    if (!booksRow.artists) book.artists = db.getBookArtists(booksRow.id)
    if (!booksRow.tags) book.tags = db.getBookTags(booksRow.id)

    return book;
}

exports.getBooks = function () {
    console.log("/allbooks")
    let booksRow = db.getBooks()
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

exports.getBookPage = function (id, pageNum) {
    let book = db.getBookByID(id)
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

exports.getBook = function (id) {
    let book = db.getBookByID(id)
    return fillBook(book)
}

exports.updateBook = function(id, newBookData) {
    let response = { success: false, errors: "" }
    let bookData = exports.getBook(id);
    if (newBookData.tags && bookData.tags) {
        let tagsToAdd = newBookData.tags.filter(t => !bookData.tags.includes(t))
        let tagsToRemove = bookData.tags.filter(t => !newBookData.tags.includes(t))

        if (tagsToAdd.length) {
            let addResult = db.addTags(id, tagsToAdd)
            if (addResult.length === tagsToAdd.length) {
                response.success = true;
            } else {
                response.errors = response.errors + "Adding tags failed"
            }
        } 
        if (tagsToRemove.length) {
            let removeResult = db.removeTags(id, tagsToRemove)
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
                let updateResult = db.setHiddenPages(id, newBookData.hiddenPages)
                if (updateResult) response.success = true
            } catch (err) {
                response.errors = response.errors + err.message
            }
        }
        
    }
    if (newBookData.isFavorite !== bookData.isFavorite) {
        try {
            let updateResult = db.setFavoriteValue(id, newBookData.isFavorite)
            if (updateResult) response.success = true
        } catch (err) {
            response.errors = response.errors + err.message
        } 
    }
    if (response.errors) response.success = false
    response.book = exports.getBook(id)
    return response
}