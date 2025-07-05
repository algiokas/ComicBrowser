import { videos_db as db } from './database';

export const _BOOKS = Object.freeze({
    insert: db.prepare('INSERT INTO books (title, folderName, artGroup, prefix, language, pageCount, coverIndex, addedDate, pages, hiddenPages, isFavorite, originalTitle) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'),
    selectAll: db.prepare('SELECT * FROM books'),
    selectById: db.prepare('SELECT * FROM books WHERE id = ?'),
    selectByTitle: db.prepare('SELECT * FROM books WHERE title = ?'),
    delete: db.prepare('DELETE FROM books WHERE id = ?'),
    updateTitle: db.prepare('UPDATE books SET title = ? WHERE id = ?'),
    updateArtGroup: db.prepare('UPDATE books SET artGroup = ? WHERE id = ?'),
    updateHiddenPages: db.prepare('UPDATE books SET hiddenPages = ? WHERE id = ?'),
    updateFavoriteValue: db.prepare('UPDATE books SET isFavorite = ? WHERE id = ?'),
})

export const _ARTISTS = Object.freeze({
    insert: db.prepare('INSERT INTO artists (name) VALUES (?)'),
    selectById: db.prepare('SELECT name FROM artists WHERE id = ?'),
    selectByName: db.prepare('SELECT * FROM artists WHERE name = ?'),
    selectArtistsByBookId: db.prepare('SELECT artists.name FROM bookArtists JOIN artists ON bookArtists.artistId = artists.id WHERE bookArtists.bookId = ?'),
    delete: db.prepare('DELETE FROM artists WHERE id = ?')
})

export const _BOOKARTISTS = Object.freeze({
    insert: db.prepare('INSERT INTO bookArtists (bookId, artistId) VALUES (?, ?)'),
    selectByBookId: db.prepare('SELECT * FROM bookArtists WHERE bookId = ?'),
    selectByArtistId: db.prepare('SELECT * FROM bookArtists WHERE artistId = ?'),
    delete: db.prepare('DELETE FROM bookArtists WHERE bookId = ? AND artistId = ?')
})

export const _TAGS = Object.freeze({
    insert: db.prepare('INSERT INTO tags (name) VALUES (?)'),
    selectNameById: db.prepare('SELECT name FROM tags WHERE id = ?'),
    selectByName: db.prepare('SELECT * FROM tags WHERE name = ?'),
    selectTagsByBookId: db.prepare('SELECT tags.name FROM bookTags JOIN tags ON bookTags.tagId = tags.id WHERE bookTags.bookId = ?'),
    delete: db.prepare('DELETE FROM tags WHERE id = ?')
})

export const _BOOKTAGS = Object.freeze({
    insert: db.prepare('INSERT INTO bookTags (bookId, tagId) VALUES (?, ?)'),
    selectByBookId: db.prepare('SELECT * FROM bookTags WHERE bookId = ?'),
    selectByTagId: db.prepare('SELECT * FROM bookTags WHERE tagId = ?'),
    delete: db.prepare('DELETE FROM bookTags WHERE bookId = ? AND tagId = ?')
})

export const _COLLECTIONS = Object.freeze({
    insert: db.prepare('INSERT INTO collections (name, coverImage, coverBook, coverPage) VALUES (?, ?, ?, ?)'),
    selectAll: db.prepare('SELECT * FROM collections'),
    selectById: db.prepare('SELECT * FROM collections WHERE id = ?'),
    selectByRowId: db.prepare('SELECT * FROM collections WHERE rowid = ?'),
})

export const _COLLECTIONBOOKS = Object.freeze({
    insert: db.prepare('INSERT INTO collectionBooks (collectionId, bookId, sortOrder) VALUES (?, ?, ?)'),
    selectByCollectionId: db.prepare('SELECT bookId FROM collectionBooks WHERE collectionID = ? ORDER BY sortOrder')
})

