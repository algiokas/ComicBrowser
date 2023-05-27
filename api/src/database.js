var sqlite3 = require('sqlite3')

const DBSOURCE = "data/db.sqlite"

function handleError(err) {
    let test = err.message.match(/table .* already exists/)
    if (!test) {
        console.log(err.message)
    }
}

let db = new sqlite3.Database(DBSOURCE, (err) => {
    console.log("API Started in " + process.cwd())
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT, 
                folderName TEXT,
                artGroup TEXT,
                prefix TEXT,
                language TEXT,
                pageCount INTEGER,
                coverIndex INTEGER,
                pages TEXT)`,
            (err) => {
                if (err) {
                    handleError(err)
                } else {
                    console.log('created "books" table')
                }
            });
        db.run(`CREATE TABLE artists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE)`,
            (err) => {
                if (err) {
                    handleError(err)
                } else {
                    console.log('created "artists" table')
                }
            });
        db.run(`CREATE TABLE bookArtists (
                bookId INTEGER
                artistsId INTEGER)`,
            (err) => {
                if (err) {
                    handleError(err)
                } else {
                    console.log('created "bookArtists" table')
                }
            });
        db.run(`CREATE TABLE tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE)`,
            (err) => {
                if (err) {
                    handleError(err)
                } else {
                    console.log('created "tags" table')
                }
            });
        db.run(`CREATE TABLE bookTags (
            bookId INTEGER
            tagId INTEGER)`,
                (err) => {
                    if (err) {
                        handleError(err)
                    } else {
                        console.log('created "bookTags" table')
                    }
            });
    }
});


module.exports = db