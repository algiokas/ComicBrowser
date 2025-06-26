import Database from 'better-sqlite3';

const BOOKS_DBSOURCE = "data/books.sqlite"
const VIDEO_DBSOURCE = "data/videos.sqlite"


const books_db = new Database(BOOKS_DBSOURCE); //, { verbose: console.log });
const videos_db = new Database(VIDEO_DBSOURCE);

function initBooks() {
    try {
        books_db.prepare(`CREATE TABLE books (
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
    } catch (err: any) {
        if (err.message === 'table books already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }       
    }
    
    try {
        books_db.prepare(`CREATE TABLE artists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE)`).run()
        console.log('created table: artists')
    } catch (err: any) {
        if (err.message === 'table artists already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        books_db.prepare(`CREATE TABLE bookArtists (
        bookId INTEGER,
        artistId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(artistId) REFERENCES artists(id))`).run()
        console.log('created table: bookArtists')
    } catch (err: any) {
        if (err.message === 'table bookArtists already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        books_db.prepare(`CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: tags')
    } catch (err: any) {
        if (err.message === 'table tags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        books_db.prepare(`CREATE TABLE bookTags (
        bookId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(tagId) REFERENCES tags(id))`).run()
        console.log('created table: bookTags')
    } catch (err: any) {
        if (err.message === 'table bookTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        books_db.prepare(`CREATE TABLE collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            coverImage TEXT,
            coverBook INTEGER,
            coverPage INTEGER,
            FOREIGN KEY(coverBook) REFERENCES books(id))`).run()
        console.log('created table: collections')
    } catch (err: any) {
        if (err.message === 'table collections already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        books_db.prepare(`CREATE TABLE collectionBooks (
            collectionId INTEGER,
            bookId INTEGER,
            sortOrder INTEGER,
            FOREIGN KEY(collectionId) REFERENCES collections(id),
            FOREIGN KEY(bookId) REFERENCES books(id))`).run()
        console.log('created table: collectionBooks')
    } catch (err: any) {
        if (err.message === 'table collectionBooks already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
}

function initVideos() {
    try {
        videos_db.prepare(`CREATE TABLE videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, 
            thumbnailId TEXT,
            filePath TEXT,
            fileExt TEXT,
            addedDate TEXT,
            isFavorite INTEGER,
            originalTitle TEXT,
            sourceId INTEGER)`).run()
        console.log('created table: videos')
    } catch (err: any) {
        if (err.message === 'table videos already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }       
    }

    try {
        videos_db.prepare(`CREATE TABLE sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            imageFileSmall TEXT,
            imageFileLarge TEXT,
            siteUrl TEXT,
            name TEXT UNIQUE)`).run()
        console.log('created table: sources')
    } catch (err: any) {
        if (err.message === 'table sources already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        videos_db.prepare(`CREATE TABLE actors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            imageFile TEXT,
            imageFallbackVideoId INTEGER,
            isFavorite INTEGER,
            FOREIGN KEY(imageFallbackVideoId) REFERENCES videos(id))`).run()
        console.log('created table: actors')
    } catch (err: any) {
        if (err.message === 'table actors already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        videos_db.prepare(`CREATE TABLE videoActors (
            videoId INTEGER,
            actorId INTEGER,
            FOREIGN KEY(videoId) REFERENCES videos(id),
            FOREIGN KEY(actorId) REFERENCES actors(id))`).run()
        console.log('created table: videoActors')
    } catch (err: any) {
        if (err.message === 'table videoActors already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        videos_db.prepare(`CREATE TABLE actorTags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: actorTags')
    } catch (err: any) {
        if (err.message === 'table actorTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        videos_db.prepare(`CREATE TABLE videoTags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE)`).run()
        console.log('created table: videoTags')
    } catch (err: any) {
        if (err.message === 'table videoTags already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
    
    try {
        videos_db.prepare(`CREATE TABLE actorTagsRef (
        actorId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(actorId) REFERENCES actors(id),
        FOREIGN KEY(tagId) REFERENCES actorTags(id))`).run()
        console.log('created table: actorTagsRef')
    } catch (err: any) {
        if (err.message === 'table actorTagsRef already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }

    try {
        videos_db.prepare(`CREATE TABLE videoTagsRef (
        videoId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(tagId) REFERENCES videoTags(id))`).run()
        console.log('created table: videoTagsRef')
    } catch (err: any) {
        if (err.message === 'table videoTagsRef already exists') {
            console.log(err.message)
        } else {
            console.error(err)
        }
    }
}

initBooks();
initVideos();

const _books_db = books_db;
export { _books_db as books_db };
const _videos_db = videos_db;
export { _videos_db as videos_db };

