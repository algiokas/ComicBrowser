import { RunResult } from 'better-sqlite3'
import { Artist, BookArtist, BookRow, BookTag, ClientBook, ClientCollection, CollectionBook, CollectionRow, FolderJSON, Tag } from '../types/book'
import { RunResultExisting } from '../types/shared'
import { _BOOKS, _ARTISTS, _BOOKARTISTS, _TAGS, _BOOKTAGS, _COLLECTIONS, _COLLECTIONBOOKS } from './bookQueries'

function insertBookFromJson(bookJson: FolderJSON): RunResult | null {
    try {
        return _BOOKS.insert.run(
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
    return null
}

function insertArtistIfMissing(artistName: string): RunResultExisting | null {
    if (!artistName) {
        console.log('cannot input blank artist name')
        return null
    }
    let existing = _ARTISTS.selectByName.get(artistName) as Artist
    if (existing) {
        console.log('Artist: "' + artistName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return _ARTISTS.insert.run(artistName)
}

function insertArtistsForBook(bookId: number, artists: string[]): number[] {
    if (!artists) {
        console.log('Book ID ' + bookId + 'artist list empty')
        return []
    }

    let artistIds: number[] = []
    artists.forEach((artist) => {
        let insertResult = insertArtistIfMissing(artist)
        if (insertResult) {
            let artistId = Number(insertResult.lastInsertRowid ?? insertResult.existingRowId)
            if (!isNaN(artistId)) {
                _BOOKARTISTS.insert.run(bookId, artistId)
                artistIds.push(artistId)
            }
        }
    })
    return artistIds
}

function removeArtistsFromBook(bookId: number, artists: string[]): number[] {
    if (!artists) {
        console.log('Book ID ' + bookId + 'artist list empty')
        return []
    }

    let artistIds: number[] = []
    artists.forEach((artist) => {
        let artistRow = _ARTISTS.selectByName.get(artist) as Artist
        if (artistRow) {
            artistIds.push(artistRow.id)
            _BOOKARTISTS.delete.run(bookId, artistRow.id)
            let otherBookArtists = _BOOKARTISTS.selectByArtistId.all(artistRow.id)
            if (otherBookArtists.length < 1) {
                _ARTISTS.delete.run(artistRow.id)
            }
        }
    })
    return artistIds
}

function removeAllArtistsForBook(bookId: number): number[] {
    if (!bookId) console.error('invalid book ID')
    let artistRows = _BOOKARTISTS.selectByBookId.all(bookId) as BookArtist[]
    let removedArtists: number[] = []
    if (artistRows && artistRows.length > 0) {
        artistRows.forEach(idRow => {
            console.log("removing artist ID: " + idRow.artistId + " from book ID: " + bookId)
            let deleteResult = _BOOKARTISTS.delete.run(bookId, idRow.artistId)
            console.log(deleteResult)
            let otherBooksWithArtist = _BOOKARTISTS.selectByArtistId.all(idRow.artistId)
            console.log('other books with artist ID: ' + idRow.artistId)
            console.log(otherBooksWithArtist)
            if (otherBooksWithArtist.length < 1) {
                let artistDeleteResult = _ARTISTS.delete.run(idRow.artistId)
                if (artistDeleteResult.changes > 0) {
                    removedArtists.push(idRow.artistId)
                }
            }
        })
    }
    return removedArtists
}

function insertTagIfMissing(tagName: string): RunResultExisting | null {
    if (!tagName) {
        console.log('cannot input blank tag name')
        return null
    }
    let existing = _TAGS.selectByName.get(tagName) as Tag
    if (existing) {
        console.log('Tag: "' + tagName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return _TAGS.insert.run(tagName)
}

function insertTagsForBook(bookId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Book ID ' + bookId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let insertResult = insertTagIfMissing(tag)
        if (insertResult) {
            let tagId = Number(insertResult.lastInsertRowid ?? insertResult.existingRowId)
            if (!isNaN(tagId)) {
                _BOOKTAGS.insert.run(bookId, tagId)
                tagIds.push(tagId)
            }
        }

    })
    return tagIds
}

function removeTagsFromBook(bookId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Book ID ' + bookId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let tagRow = _TAGS.selectByName.get(tag) as Tag
        if (tagRow) {
            tagIds.push(tagRow.id)
            _BOOKTAGS.delete.run(bookId, tagRow.id)
            let otherBookTags = _BOOKTAGS.selectByTagId.all(tagRow.id)
            if (otherBookTags.length < 1) {
                _TAGS.delete.run(tagRow.id)
            }
        }
    })
    return tagIds
}

function removeAllTagsForBook(bookId: number): number[] {
    if (!bookId) console.error('invalid book ID')
    let tagRows = _BOOKTAGS.selectByBookId.all(bookId) as BookTag[]
    let removedTags: number[] = []
    if (tagRows && tagRows.length > 0) {
        tagRows.forEach((idRow) => {
            _BOOKTAGS.delete.run(bookId, idRow.tagId)
            let otherBooksWithTag = _BOOKTAGS.selectByTagId.all(idRow.tagId)
            if (otherBooksWithTag.length < 1) {
                _TAGS.delete.run(idRow.tagId)
                removedTags.push(idRow.tagId)
            }
        })
    }
    return removedTags
}

//Adds book, artists and (soon) tags to all relevant DBs
function addBookToDb(bookJson: FolderJSON): RunResult | null {
    let insertResult = insertBookFromJson(bookJson)
    if (insertResult) {
        const bookId = Number(insertResult.lastInsertRowid)
        insertArtistsForBook(bookId, bookJson.artists)
        insertTagsForBook(bookId, bookJson.tags)
    }
    return insertResult
}

function removeBookFromDb(bookId: number) {
    let artistIds = removeAllArtistsForBook(bookId)
    let tagIds = removeAllTagsForBook(bookId)
    let deleteResult = _BOOKS.delete.run(bookId)
    return deleteResult
}

export function addBook(bookJson: FolderJSON, replace = false): RunResultExisting | null {
    if (!replace) {
        let existing = _BOOKS.selectByTitle.get(bookJson.title) as BookRow
        if (existing && existing.folderName === bookJson.folderName) {
            console.log('Book: "' + bookJson.title + '" found. Skipping...')
            return { existingRowId: existing.id }
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

export function deleteBook(bookId: number) {
    let bookData = _BOOKS.selectById.get(bookId) as BookRow;
    if (!bookData) return { success: false, error: 'book not found' };
    return removeBookFromDb(bookId);
};

export function getBookArtists(bookId: number): string[] {
    const artists = _ARTISTS.selectArtistsByBookId.all(bookId) as { name: string }[]
    return artists.map(a => a.name)
}

export function getBookTags(bookId: number): string[] {
    const tags = _TAGS.selectTagsByBookId.all(bookId) as Tag[]
    return tags.map(t => t.name)
}

export function getBooks(): BookRow[] {
    return _BOOKS.selectAll.all() as BookRow[]
}

export function getBookByID(id: number): BookRow {
    return _BOOKS.selectById.get(id) as BookRow;
};

export function addTags(bookId: number, tags: string[]): number[] {
    return insertTagsForBook(bookId, tags)
}

export function removeTags(bookId: number, tags: string[]): number[] {
    return removeTagsFromBook(bookId, tags)
}

export function addArtists(bookId: number, artists: string[]): number[] {
    return insertArtistsForBook(bookId, artists)
}

export function removeArtists(bookId: number, artists: string[]): number[] {
    return removeArtistsFromBook(bookId, artists)
}

export function setHiddenPages(bookId: number, hiddenPages: number[]): RunResult {
    return _BOOKS.updateHiddenPages.run(JSON.stringify(hiddenPages), bookId)
}

export function setTitle(bookId: number, title: string): RunResult {
    return _BOOKS.updateTitle.run(title, bookId)
}

export function setArtGroup(bookId: number, groupName: string): RunResult {
    return _BOOKS.updateArtGroup.run(groupName, bookId)
}

export function setFavoriteValue(bookId: number, value: boolean): RunResult {
    return _BOOKS.updateFavoriteValue.run(value ? 1 : 0, bookId)
}

export function getAllCollections(): ClientCollection[] {
    const collectionRows = _COLLECTIONS.selectAll.all() as CollectionRow[]
    return collectionRows.map(row => fillCollection(row))
}

export function getCollectionById(id: number): ClientCollection {
    const collectionRow = _COLLECTIONS.selectById.get(id) as CollectionRow
    return fillCollection(collectionRow)
}

const fillCollection = function (collectionRow: CollectionRow): ClientCollection {
    const collectionId = collectionRow.id
    const books = _COLLECTIONBOOKS.selectByCollectionId.all(collectionId) as CollectionBook[]
    const filledCollection: ClientCollection = {
        id: collectionRow.id,
        name: collectionRow.name,
        coverImage: collectionRow.coverImage ?? '',
        coverBook: collectionRow.coverBook ?? 0,
        coverPage: collectionRow.coverPage ?? 0,
        books: books
    }
    return filledCollection
}

export function createCollection(cName: string, books: ClientBook[], coverBookId: number): ClientCollection {
    const collectionInsertResult = _COLLECTIONS.insert.run(cName, '', coverBookId, 0)
    const collectionRowId = Number(collectionInsertResult.lastInsertRowid)
    const collectionRow = _COLLECTIONS.selectByRowId.get(collectionRowId) as CollectionRow
    for (let i = 0; i < books.length; i++) {
        _COLLECTIONBOOKS.insert.run(collectionRow.id, books[i].id, i)
    }
    return fillCollection(collectionRow)
}