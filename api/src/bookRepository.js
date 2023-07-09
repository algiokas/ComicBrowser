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

function folderToJSON(folderName, contents, id) {
    let output = {}
    if (!folderName || !contents || contents.length < 1) {
        return
    }
    if (id > 0) {
        output.id = id
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
    output.cover = contents[0]
    output.pages = contents

    return output
}



exports.importBooks = function (res, callback) {
    let count = 0;
    let books = [];
    fs.readdir(imageDirectory, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach((file) => {
            let json = getBookData(file)
            if (json && !json.error) {
                books.push(json)
            }
        })
        
        db.serialize(function () {
            books.forEach((book) => {
                importBookIfMissing(book, (importResult) => {
                    if (importResult && importResult.success) {
                        count++
                    }
                    else if (importResult && !importResult.success) {
                        if (importResult.error) {
                            console.log(importResult.error)
                        }
                        else {
                            console.log("unable to import file: " + file)
                        }
                    }
                    else {
                        console.log("import failed")
                    }
                })
            })
        })
        
        callback(res, { books: books })
    })
}

function getBookData(file) {
    let fullpath = path.join(imageDirectory, file);
    if (fs.statSync(fullpath).isDirectory()) {
        try {
            const files = fs.readdirSync(fullpath);
            let folderContents = [];
            files.forEach((file) => {
                folderContents.push(file);
            });
            return folderToJSON(file, folderContents);
        } catch (err) {
            return { error: err } 
        }
    }
}

function importBookIfMissing(bookJson, callback) {
    let checkParams = [bookJson.title]
    db.get(getBookByTitle, checkParams, (err, row) => {
        if (err || !row) {
            addBookToDb(bookJson, callback)
        } else {
            if (err) {
                callback({ success: false, error: err })
            } else if (row) {
                callback({ success: false, error: `existing book found with ID: ${row.id}` })
            } else {
                callback({ success: false })
            }  
        }
    })
}

 function addBookToDb(bookJSON, callback) {
    if (!bookJSON.title)
        console.log('importBook - invalid JSON')

    let bookParams = [
        bookJSON.title,
        bookJSON.folderName,
        bookJSON.artGroup,
        bookJSON.prefix,
        bookJSON.language,
        bookJSON.pageCount,
        0,
        JSON.stringify(bookJSON.pages)
    ]

    db.run(insertBook, bookParams, function (err) {
        if (err) {
            console.log(err)
        } else {
            //console.log("inserting book with ID: " + this.lastID)
            if (bookJSON.artists && bookJSON.artists.length > 0) {
                bookJSON.artists.forEach(artist => {
                    //console.log(artist)
                })
            }
            callback({ success: true, book: bookJSON })
        }
    })
}

exports.importTags = function (bookJSON) {
    if (!bookJSON.tags || bookJSON.tags.length < 1) console.log('importTags - no tags')
    bookJSON.tags.forEach(tag => {
        db.run(insertTag, [], (err) => {
            if (err) {
                console.log(err)
            }
        })
    })

}

exports.importAuthors = function (bookJSON) {
    if (!bookJSON.title) console.log('importAuthors - invalid JSON')
    let params = [
        bookJSON.title,
        bookJSON.folderName,
        bookJSON.prefix,
        bookJSON.artGroup,
        bookJSON.language,
        bookJSON.pageCount,
        0,
        JSON.stringify(bookJSON.pages)
    ]
    console.log(params)
    db.run(insertBook, params, (err) => {
        if (err) {
            console.log(err)
        }
    })
}

exports.getBooks = function (callback) {
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
        callback(rows)
    })
}

exports.getBookData = function (id, pageNum, res, callback) {
    var params = [id]
    db.get(getBookByID, params, (err, row) => {
        if (err) {
            console.log(err)
        }
        if (row && row.pages) {
            //console.log(row.title + " page " + req.params.pageNum)
            let pageList = JSON.parse(row.pages)
            if (pageNum < pageList.length) {
                callback(res, row.folderName, pageList[pageNum])
            } else {
                console.log('page number out of range')
            }
        } else {
            console.log(`unable to fetch data for book ID: ${id}`)
        }
    })
}