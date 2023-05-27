const languages = ["Japanese", "English", "Chinese", "Translated"]
const db = require('../src/database')

exports.getFileName = function (id, book) {
    return String(id).padStart(4, '0') + ' - ' + book.title
}

exports.folderToJSON = function (folderName, contents, id) {
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

const insertBook = 'INSERT INTO books (title, folderName, artGroup, prefix, language, pageCount, coverIndex, pages) VALUES (?,?,?,?,?,?,?,?)'
const insertArtist = 'INSERT INTO artists (name) VALUES (?)'
const insertTag = 'INSERT INTO tags (name) VALUES (?)'
const selectBooks = 'SELECT * FROM books'
const getBookByID = "SELECT * FROM books WHERE id = ?"
const getBookByTitle = "SELECT * FROM books WHERE title = ?"

exports.importBook = async function (bookJSON) {
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
    let checkParams = [
        bookJSON.title
    ]
    db.get(getBookByTitle, checkParams, (err, row) => {
        if (err || !row) {
            db.run(insertBook, bookParams, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("inserting book with ID: " + this.lastID)
                    if (bookJSON.artists && bookJSON.artists.length > 0) {
                        bookJSON.artists.forEach(artist => {
                            console.log(artist)
                        })
                    }
                    return { success: true, id: this.lastID}
                }
            })
        } else {
            if (err) {
                console.log(err)
            }       
            return {success: false, id: row.id}
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

exports.getBooks = function () {
    var params = []
    db.all(selectBooks, params, function (err, rows) {
        console.log(err)
        console.log(rows)
        return rows
    })
}