import Database from 'better-sqlite3';

const BOOKS_DBSOURCE = "data/books.sqlite";
const VIDEO_DBSOURCE = "data/videos.sqlite";

const books_db = new Database(BOOKS_DBSOURCE);
const videos_db = new Database(VIDEO_DBSOURCE);

// Optional but recommended: enable foreign key enforcement
books_db.pragma('foreign_keys = ON');
videos_db.pragma('foreign_keys = ON');

function createTable(db: Database.Database, name: string, schema: string) {
    try {
        db.prepare(`CREATE TABLE ${name} (${schema})`).run();
        console.log(`created table: ${name}`);
    } catch (err: any) {
        if (err.message.includes(`table ${name} already exists`)) {
            console.log(err.message);
        } else {
            console.error(err);
        }
    }
}

function initBooks() {
    createTable(books_db, 'books', `
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
        originalTitle TEXT
    `);

    createTable(books_db, 'artists', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    `);

    createTable(books_db, 'bookArtists', `
        bookId INTEGER,
        artistId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(artistId) REFERENCES artists(id)
    `);

    createTable(books_db, 'tags', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    `);

    createTable(books_db, 'bookTags', `
        bookId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(bookId) REFERENCES books(id),
        FOREIGN KEY(tagId) REFERENCES tags(id)
    `);

    createTable(books_db, 'collections', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        coverImage TEXT,
        coverBook INTEGER,
        coverPage INTEGER,
        FOREIGN KEY(coverBook) REFERENCES books(id)
    `);

    createTable(books_db, 'collectionBooks', `
        collectionId INTEGER,
        bookId INTEGER,
        sortOrder INTEGER,
        FOREIGN KEY(collectionId) REFERENCES collections(id),
        FOREIGN KEY(bookId) REFERENCES books(id)
    `);
}

function initVideos() {
    createTable(videos_db, 'videos', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, 
        thumbnailId TEXT,
        filePath TEXT,
        fileExt TEXT,
        addedDate TEXT,
        isFavorite INTEGER,
        originalTitle TEXT,
        sourceId INTEGER
    `);

    createTable(videos_db, 'sources', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imageFileSmall TEXT,
        imageFileLarge TEXT,
        siteUrl TEXT,
        name TEXT UNIQUE
    `);

    createTable(videos_db, 'actors', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        imageFile TEXT,
        imageFallbackVideoId INTEGER,
        isFavorite INTEGER,
        FOREIGN KEY(imageFallbackVideoId) REFERENCES videos(id)
    `);

    createTable(videos_db, 'videoActors', `
        videoId INTEGER,
        actorId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(actorId) REFERENCES actors(id)
    `);

    createTable(videos_db, 'actorTags', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    `);

    createTable(videos_db, 'videoTags', `
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    `);

    createTable(videos_db, 'actorTagsRef', `
        actorId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(actorId) REFERENCES actors(id),
        FOREIGN KEY(tagId) REFERENCES actorTags(id)
    `);

    createTable(videos_db, 'videoTagsRef', `
        videoId INTEGER,
        tagId INTEGER,
        FOREIGN KEY(videoId) REFERENCES videos(id),
        FOREIGN KEY(tagId) REFERENCES videoTags(id)
    `);
}

initBooks();
initVideos();

export { books_db, videos_db };
