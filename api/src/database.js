const DBSOURCE = "data/db.sqlite"
const Database = require('better-sqlite3');

const db = new Database(DBSOURCE); //, { verbose: console.log });

function init() {
    try {
        db.prepare(`CREATE TABLE books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, 
            folderName TEXT,
            artGroup TEXT,
            prefix TEXT,
            language TEXT,
            pageCount INTEGER,
            coverIndex INTEGER,
            pages TEXT,
            hiddenPages TEXT,
            isFavorite INTEGER)`).run()
        console.log('created table: books')
    } catch (err) {
        if (err.message === 'table books already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
        
    }
    
    try {
        db.prepare(`CREATE TABLE artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE)`).run()
        console.log('created table: artists')
    } catch (err) {
        if (err.message === 'table artists already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE bookArtists (
        bookId INTEGER,
        artistId INTEGER)`).run()
        console.log('created table: bookArtists')
    } catch (err) {
        if (err.message === 'table bookArtists already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: tags')
    } catch (err) {
        if (err.message === 'table tags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE bookTags (
        bookId INTEGER,
        tagId INTEGER)`).run()
        console.log('created table: bookTags')
    } catch (err) {
        if (err.message === 'table bookTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
}

init();

const insertBook = db.prepare('INSERT INTO books (title, folderName, artGroup, prefix, language, pageCount, coverIndex, pages, hiddenPages, isFavorite) VALUES (?,?,?,?,?,?,?,?,?,?)');
const insertArtist = db.prepare('INSERT INTO artists (name) VALUES (?)')
const insertBookArtist = db.prepare('INSERT INTO bookArtists (bookId, artistId) VALUES (?, ?)')
const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)')
const insertBookTag = db.prepare('INSERT INTO bookTags (bookId, tagId) VALUES (?, ?)')
const selectBooks = db.prepare('SELECT * FROM books')
const getBookByID = db.prepare('SELECT * FROM books WHERE id = ?')
const getBookByTitle = db.prepare('SELECT * FROM books WHERE title = ?')
const getArtistById = db.prepare('SELECT name FROM artists WHERE id = ?')
const getArtistByName = db.prepare('SELECT * FROM artists WHERE name = ?')
const getTagById = db.prepare('SELECT name FROM tags WHERE id = ?')
const getTagByName = db.prepare('SELECT * FROM tags WHERE name = ?')
const selectBookArtistIds = db.prepare('SELECT * FROM bookArtists WHERE bookId = ?')
const selectBookTagIds = db.prepare('SELECT * FROM bookTags WHERE bookId = ?')
const selectBookTagsByTag = db.prepare('SELECT * FROM bookTags WHERE tagId = ?')
const deleteTag = db.prepare('DELETE FROM tags WHERE id = ?')
const deleteBookTag = db.prepare('DELETE FROM bookTags WHERE bookId = ? AND tagId = ?')
const updateHiddenPages = db.prepare('UPDATE books SET hiddenPages = ? WHERE id = ?')
const updateFavoriteValue = db.prepare('UPDATE books SET isFavorite = ? WHERE id = ?')

function insertBookFromJson(bookJson) {
    return insertBook.run(
        bookJson.title, 
        bookJson.folderName, 
        bookJson.artGroup, 
        bookJson.prefix, 
        bookJson.language, 
        bookJson.pageCount, 
        bookJson.coverIndex, 
        JSON.stringify(bookJson.pages),
        JSON.stringify([]), 0)
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

//Adds book, artists and (soon) tags to all relevant DBs
function addBookToDb(bookJson) {
    let insertResult = insertBookFromJson(bookJson)
    let artistIds = insertArtistsForBook(insertResult.lastInsertRowid, bookJson.artists)
    let tagIds = insertTagsForBook(insertResult.lastInsertRowid, bookJson.tags)
    insertResult.artistIds = artistIds
    insertResult.tagIds = tagIds
    return insertResult
}

exports.addBook = function(bookJson, replace = false) {
    if (!replace) {
        let existing = getBookByTitle.get(bookJson.title)
        if (existing) {
            console.log('Book: "' + bookJson.title + '" found. Skipping...')
            return { existingRowId: existing.id}
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

exports.getBookArtists = function(bookId) {
    if (!bookId) console.err('invalid book ID')
    let artistIds = selectBookArtistIds.all(bookId)
    let artists = []
    if (artistIds && artistIds.length > 0) {
        artistIds.forEach((idRow) => {
            let artist = getArtistById.get(idRow.artistId)
            artists.push(artist.name)
        })
    }
    return artists
}

exports.getBookTags = function(bookId) {
    if (!bookId) console.err('invalid book ID')
    let tagIds = selectBookTagIds.all(bookId)
    let tags = []
    if (tagIds && tagIds.length > 0) {
        tagIds.forEach((idRow) => {
            let tag = getTagById.get(idRow.tagId)
            tags.push(tag.name)
        })
    }
    return tags
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

exports.setHiddenPages = function(bookId, hiddenPages) {
    return updateHiddenPages.run(JSON.stringify(hiddenPages), bookId)
}

exports.setFavoriteValue = function(bookId, value) {
    if (typeof value !== "boolean") {
        throw new Error("TypeError - Favorite value must be boolean")    
    }
    return updateFavoriteValue.run(value ? 1 : 0, bookId)
}