const DBSOURCE = "data/db.sqlite"
const Database = require('better-sqlite3');

const db = new Database(DBSOURCE, { verbose: console.log });

const insertBook = db.prepare('INSERT INTO books (title, folderName, artGroup, prefix, language, pageCount, coverIndex, pages) VALUES (?,?,?,?,?,?,?,?)');
const insertArtist = db.prepare('INSERT INTO artists (name) VALUES (?)')
const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)')
const selectBooks = db.prepare('SELECT * FROM books')
const getBookByID = db.prepare('SELECT * FROM books WHERE id = ?')
const getBookByTitle = db.prepare('SELECT * FROM books WHERE title = ?')

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
            pages TEXT)`).run()
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
        bookId INTEGER
        artistsId INTEGER)`).run()
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
        bookId INTEGER
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

let test = selectBooks.run()

test.forEach(book => {
    console.log(book.title)  
});

init();