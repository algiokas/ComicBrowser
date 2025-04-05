const db = require('../src/database').books_db

const insertBook = db.prepare('INSERT INTO books (title, folderName, artGroup, prefix, language, pageCount, coverIndex, addedDate, pages, hiddenPages, isFavorite, originalTitle) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
const insertArtist = db.prepare('INSERT INTO artists (name) VALUES (?)')
const insertBookArtist = db.prepare('INSERT INTO bookArtists (bookId, artistId) VALUES (?, ?)')
const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)')
const insertBookTag = db.prepare('INSERT INTO bookTags (bookId, tagId) VALUES (?, ?)')
const insertCollection = db.prepare('INSERT INTO collections (name, coverImage, coverBook, coverPage) VALUES (?, ?, ?, ?)')
const insertCollectionBook = db.prepare('INSERT INTO collectionBooks (collectionId, bookId, sortOrder) VALUES (?, ?, ?)')
const selectBooks = db.prepare('SELECT * FROM books')
const selectCollections = db.prepare('SELECT * FROM collections')
const selectCollectionById = db.prepare('SELECT * FROM collections WHERE id = ?')
const selectCollectionByRow = db.prepare('SELECT * FROM collections WHERE rowid = ?')
const selectCollectionBooks = db.prepare('SELECT bookId FROM collectionBooks WHERE collectionID = ? ORDER BY sortOrder')
const getBookByID = db.prepare('SELECT * FROM books WHERE id = ?')
const getBookByTitle = db.prepare('SELECT * FROM books WHERE title = ?')
const getArtistById = db.prepare('SELECT name FROM artists WHERE id = ?')
const getArtistByName = db.prepare('SELECT * FROM artists WHERE name = ?')
const getArtistsByBookId = db.prepare('SELECT artists.name FROM bookArtists JOIN artists ON bookArtists.artistId = artists.id WHERE bookArtists.bookId = ?');
const getTagById = db.prepare('SELECT name FROM tags WHERE id = ?')
const getTagByName = db.prepare('SELECT * FROM tags WHERE name = ?')
const getTagsByBookId = db.prepare('SELECT tags.name FROM bookTags JOIN tags ON bookTags.tagId = tags.id WHERE bookTags.bookId = ?');
const selectBookArtistIds = db.prepare('SELECT * FROM bookArtists WHERE bookId = ?')
const selectBookArtistsByArtist = db.prepare('SELECT * FROM bookArtists WHERE artistId = ?')
const selectBookTagIds = db.prepare('SELECT * FROM bookTags WHERE bookId = ?')
const selectBookTagsByTag = db.prepare('SELECT * FROM bookTags WHERE tagId = ?')
const deleteBook = db.prepare('DELETE FROM books WHERE id = ?')
const deleteTag = db.prepare('DELETE FROM tags WHERE id = ?')
const deleteBookTag = db.prepare('DELETE FROM bookTags WHERE bookId = ? AND tagId = ?')
const deleteArtist = db.prepare('DELETE FROM artists WHERE id = ?')
const deleteBookArtist = db.prepare('DELETE FROM bookArtists WHERE bookId = ? AND artistId = ?')
const updateHiddenPages = db.prepare('UPDATE books SET hiddenPages = ? WHERE id = ?')
const updateFavoriteValue = db.prepare('UPDATE books SET isFavorite = ? WHERE id = ?')
const updateTitle = db.prepare('UPDATE books SET title = ? WHERE id = ?')
const updateArtGroup = db.prepare('UPDATE books SET artGroup = ? WHERE id = ?')

function insertBookFromJson(bookJson) {
    try {
        return insertBook.run(
            bookJson.title, 
            bookJson.folderName, 
            bookJson.artGroup, 
            bookJson.prefix, 
            bookJson.language, 
            bookJson.pageCount, 
            bookJson.coverIndex,
            bookJson.addedDate.toString(),
            JSON.stringify(bookJson.pages),
            JSON.stringify([]), 0,
            bookJson.folderName)
    } catch (err) {
        console.error("Failed to insert book " + bookJson.title)
        console.log(err)
    }

}

function insertArtistIfMissing(artistName) {
    if (!artistName) {
        console.log('cannot input blank artist name')
        return null
    }
    let existing = getArtistByName.get(artistName)
    if (existing) {
        console.log('Artist: "' + artistName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return insertArtist.run(artistName)
}

function insertArtistsForBook(bookId, artists) {
    if (!artists) {
        console.log('Book ID ' + bookId + 'artist list empty')
        return []
    }

    let artistIds = []
    artists.forEach((artist) => {
        let insertResult = insertArtistIfMissing(artist)
        if (insertResult) {
            let artistId = insertResult.lastInsertRowid 
                        ?? insertResult.existingRowId
            insertBookArtist.run(bookId, artistId)
            artistIds.push(artistId)
        }
    })
    return artistIds
}

function removeArtistsFromBook(bookId, artists) {
    if (!artists) {
        console.log('Book ID ' + bookId + 'artist list empty')
        return []
    }

    let artistIds = []
    artists.forEach((artist) => {
        let artistRow = getArtistByName.get(artist)
        if (artistRow) {
            artistIds.push(artistRow.id)
            deleteBookArtist.run(bookId, artistRow.id)
            let otherBookArtists = selectBookArtistsByArtist.all(artistRow.id)
            if (otherBookArtists.length < 1) {
                deleteArtist.run(artistRow.id)
            }
        }
    })
    return artistIds
}

function removeAllArtistsForBook(bookId) {
    if (!bookId) console.err('invalid book ID')
    let artistRows = selectBookArtistIds.all(bookId)
    let removedArtists = []
    if (artistRows && artistRows.length > 0) {
        artistRows.forEach((idRow) => {
            console.log("removing artist ID: " + idRow.artistId + " from book ID: " + bookId)
            let deleteResult = deleteBookArtist.run(bookId, idRow.artistId)
            console.log(deleteResult)
            let otherBooksWithArtist = selectBookArtistsByArtist.all(idRow.artistId)
            console.log('other books with artist ID: ' + idRow.artistId)
            console.log(otherBooksWithArtist)
            if (otherBooksWithArtist.length < 1) {
                let artistDeleteResult = deleteArtist.run(idRow.artistId)
                if (artistDeleteResult.changes > 0) {
                    removedArtists.push(idRow.artistId)
                }
            }
        })
    }
    return removedArtists
}

function insertTagIfMissing(tagName) {
    if (!tagName) {
        console.log('cannot input blank tag name')
        return null
    }
    let existing = getTagByName.get(tagName)
    if (existing) {
        console.log('Tag: "' + tagName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return insertTag.run(tagName)
}

function insertTagsForBook(bookId, tags) {
    if (!tags) {
        console.log('Book ID ' + bookId + 'tag list empty')
        return []
    }

    let tagIds = []
    tags.forEach((tag) => {
        let insertResult = insertTagIfMissing(tag)
        if (insertResult) {
            let tagId = insertResult.lastInsertRowid 
                     ?? insertResult.existingRowId;
            insertBookTag.run(bookId, tagId)
            tagIds.push(tagId)
        }

    })
    return tagIds
}

function removeTagsFromBook(bookId, tags) {
    if (!tags) {
        console.log('Book ID ' + bookId + 'tag list empty')
        return []
    }

    let tagIds = []
    tags.forEach((tag) => {
        let tagRow = getTagByName.get(tag)
        if (tagRow) {
            tagIds.push(tagRow.id)
            deleteBookTag.run(bookId, tagRow.id)
            let otherBookTags = selectBookTagsByTag.all(tagRow.id)
            if (otherBookTags.length < 1) {
                deleteTag.run(tagRow.id)
            }
        }
    })
    return tagIds
}

function removeAllTagsForBook(bookId) {
    if (!bookId) console.err('invalid book ID')
    let tagRows = selectBookTagIds.all(bookId)
    let removedTags = []
    if (tagRows && tagRows.length > 0) {
        tagRows.forEach((idRow) => {
            let deleteResult = deleteBookTag.run(bookId, idRow.tagId)
            let otherBooksWithTag = selectBookTagsByTag.all(idRow.tagId)
            if (otherBooksWithTag.length < 1) {
                let tagDeleteResult = deleteTag.run(idRow.tagId)
                removedTags.push(idRow.tagId)
            }
        })
    }
    return removedTags
}

//Adds book, artists and (soon) tags to all relevant DBs
function addBookToDb(bookJson) {
    let insertResult = insertBookFromJson(bookJson)
    let artistIds = insertArtistsForBook(insertResult.lastInsertRowid, bookJson.artists)
    let tagIds = insertTagsForBook(insertResult.lastInsertRowid, bookJson.tags)
    insertResult.artistIds = artistIds
    insertResult.tagIds = tagIds
    return insertResult
}

function removeBookFromDb(bookId, bookData) {
    let artistIds = removeAllArtistsForBook(bookId)
    let tagIds = removeAllTagsForBook(bookId)
    let insertResult = deleteBook.run(bookId)
    insertResult.artistIds = artistIds
    insertResult.tagIds = tagIds
    return insertResult
}

exports.addBook = function(bookJson, replace = false) {
    if (!replace) {
        let existing = getBookByTitle.get(bookJson.title)
        if (existing && existing.folderName === bookJson.folderName) {
            console.log('Book: "' + bookJson.title + '" found. Skipping...')
            return { existingRow: existing}
        } else {
            console.log('Added book: "' + bookJson.title + '"')
            return addBookToDb(bookJson)
        }
    }
    else {
        //TODO: replace existing book record when `replace` is true
        return {}
    }
}

exports.deleteBook = function(bookId) {
    let bookData = getBookByID.get(bookId)
    if (!bookData) return { success: false, error: 'book not found' }
    return removeBookFromDb(bookId, bookData)
}

exports.getBookArtists = function(bookId) {
    return getArtistsByBookId.all(bookId).map(a => a.name)
}

exports.getBookTags = function(bookId) {
    return getTagsByBookId.all(bookId).map(t => t.name)
}

exports.getBooks = function() {
    return selectBooks.all()
}

exports.getBookByID = function(id) {
    return getBookByID.get(id)
}

exports.addTags = function(bookId, tags) {
    return insertTagsForBook(bookId, tags)
}

exports.removeTags = function(bookId, tags) {
    return removeTagsFromBook(bookId, tags)
}

exports.addArtists = function(bookId, artists) {
    return insertArtistsForBook(bookId, artists)
}

exports.removeArtists = function(bookId, artists) {
    return removeArtistsFromBook(bookId, artists)
}

exports.setHiddenPages = function(bookId, hiddenPages) {
    return updateHiddenPages.run(JSON.stringify(hiddenPages), bookId)
}

exports.setTitle = function(bookId, title) {
    return updateTitle.run(title, bookId)
}

exports.setArtGroup = function(bookId, groupName) {
    return updateArtGroup.run(groupName, bookId)
}

exports.setFavoriteValue = function(bookId, value) {
    if (typeof value !== "boolean") {
        throw new Error("TypeError - Favorite value must be boolean")    
    }
    return updateFavoriteValue.run(value ? 1 : 0, bookId)
}

exports.getAllCollections = function() {
    const collectionRows = selectCollections.all()
    return collectionRows.map(row => fillCollection(row))
}

exports.getCollectionById = function(id) {
    const collectionRow = selectCollectionById.get(id)
    return fillCollection(collectionRow)
}

fillCollection = function(collectionRow) {
    const collectionId = collectionRow.id
    const books = selectCollectionBooks.all(collectionId)
    collectionRow.books = books
    return collectionRow
}

exports.createCollection = function(cName, books, coverBookId) {
    const collectionInsertResult = insertCollection.run(cName, '', coverBookId, 0)
    const collectionRowId = collectionInsertResult.lastInsertRowid ?? collectionInsertResult.existingRowId
    const collectionRow = selectCollectionByRow.get(collectionRowId)
    for (let i = 0; i < books.length; i++) {
        insertCollectionBook.run(collectionRow.id, books[i].id, i)
    }
    return fillCollection(collectionRow)
}