const DBSOURCE = "data/db.sqlite"
const Database = require('better-sqlite3');

const db = new Database(DBSOURCE); //, { verbose: console.log });

function initBooks() {
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
            addedDate TEXT,
            hiddenPages TEXT,
            isFavorite INTEGER,
            originalTitle TEXT)`).run()
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
        artistId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(artistId) REFERENCES artists(id))`).run()
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
        tagId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(tagId) REFERENCES tags(id))`).run()
        console.log('created table: bookTags')
    } catch (err) {
        if (err.message === 'table bookTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        db.prepare(`CREATE TABLE collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE)`).run()
        console.log('created table: collections')
    } catch (err) {
        if (err.message === 'table collections already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        db.prepare(`CREATE TABLE collectionBooks (
            collectionId INTEGER,
            bookId INTEGER,
            FOREIGN KEY(collectionId) REFERENCES collections(id),
            FOREIGN KEY(bookId) REFERENCES books(id))`).run()
        console.log('created table: collectionBooks')
    } catch (err) {
        if (err.message === 'table collectionBooks already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
}

function initVideos() {
    try {
        db.prepare(`CREATE TABLE videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, 
            fileName TEXT,
            addedDate TEXT,
            isFavorite INTEGER,
            originalTitle TEXT)`).run()
        console.log('created table: videos')
    } catch (err) {
        if (err.message === 'table videos already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }       
    }

    try {
        db.prepare(`CREATE TABLE sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE)`).run()
        console.log('created table: sources')
    } catch (err) {
        if (err.message === 'table sources already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE videoSources (
        videoId INTEGER,
        sourceId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(sourceId) REFERENCES sources(id))`).run()
        console.log('created table: videoActors')
    } catch (err) {
        if (err.message === 'table videoActors already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE actors (
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
        db.prepare(`CREATE TABLE videoActors (
        videoId INTEGER,
        actorId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(actorId) REFERENCES actors(id))`).run()
        console.log('created table: videoActors')
    } catch (err) {
        if (err.message === 'table videoActors already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE actorTags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: actorTags')
    } catch (err) {
        if (err.message === 'table actorTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        db.prepare(`CREATE TABLE videoTags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: videoTags')
    } catch (err) {
        if (err.message === 'table videoTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        db.prepare(`CREATE TABLE actorTagsRef (
        actorId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(actorId) REFERENCES actors(id),
        FOREIGN KEY(tagId) REFERENCES actorTags(id))`).run()
        console.log('created table: actorTagsRef')
    } catch (err) {
        if (err.message === 'table actorTagsRef already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        db.prepare(`CREATE TABLE videoTagsRef (
        videoId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(tagId) REFERENCES videoTags(id))`).run()
        console.log('created table: videoTagsRef')
    } catch (err) {
        if (err.message === 'table videoTagsRef already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    // try {
    //     db.prepare(`CREATE TABLE collections (
    //         id INTEGER PRIMARY KEY AUTOINCREMENT,
    //         name TEXT UNIQUE)`).run()
    //     console.log('created table: collections')
    // } catch (err) {
    //     if (err.message === 'table collections already exists') {
    //         console.log(err.message)
    //     } else {
    //         console.error(err)
    //     }
    // }

    // try {
    //     db.prepare(`CREATE TABLE collectionBooks (
    //         collectionId INTEGER,
    //         bookId INTEGER,
    //         FOREIGN KEY(collectionId) REFERENCES collections(id),
    //         FOREIGN KEY(bookId) REFERENCES books(id))`).run()
    //     console.log('created table: collectionBooks')
    // } catch (err) {
    //     if (err.message === 'table collectionBooks already exists') {
    //         console.log(err.message)
    //     } else {
    //         console.error(err)
    //     }
    // }
}

initBooks();
initVideos();

exports.db = db