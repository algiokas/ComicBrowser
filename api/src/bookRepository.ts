import * as bookDatabase from './database/bookDatabase'
import { readdir, statSync, readdirSync, Stats } from 'fs';
import path from 'path';
import { Response } from 'express';

import 'dotenv/config';
import { BookRow, ClientBook, CreateCollectionRequest, FolderJSON, ImportBooksResult, UpdateBookResult } from './types/book.js';

const languages = ["Japanese", "English", "Chinese"]
const imageDirectory = process.env.BOOKS_IMAGE_DIR ?? '~/data/books'

export function getFileName (id: number, book: BookRow) {
    return String(id).padStart(4, '0') + ' - ' + book.title
}

//Parse data from a folder with the naming scheme:
// (prefix) [group (artist)] Title (tag1) (tag2)...
//If any of the tags are in the [languages] array they get set as the book language instead of a tag
function folderToJSON(folderName: string, contents: string[], fileStats: Stats): FolderJSON | null {
    if (!folderName || !contents || contents.length < 1) {
        return null
    }

    let output: FolderJSON = {
        folderName: '',
        prefix: '',
        artists: [],
        artGroup: '',
        title: '',
        tags: [],
        language: '',
        pageCount: 0,
        coverIndex: 0,
        pages: [],
        addedDate: Date.now()
    }

    output.folderName = folderName
    if (folderName[0] == '(')
        output.prefix = folderName.substring(1, folderName.indexOf(')', 1))

    let artistGroupStart = folderName.indexOf('[', 0)
    let artistGroupEnd = folderName.indexOf(']', artistGroupStart)
    let artistGroupString = folderName.substring(artistGroupStart + 1, artistGroupEnd)

    let artistStart = artistGroupString.indexOf('(')
    if (artistStart < 0) {
        output.artists = artistGroupString.split(',')
    }
    else {
        output.artGroup = artistGroupString.substring(0, artistStart).trim()
        output.artists = artistGroupString.substring(artistStart + 1, artistGroupString.indexOf(')')).split(',').map(s => s.trim())
    }

    let titleStart = artistGroupEnd + 1
    let suffixRegex = /\([^)]*\)|\[[^\]]*\]|\{[^\]]*\}/g;
    let suffixItems = folderName.substring(titleStart).match(suffixRegex)
    if (suffixItems && suffixItems.length > 0) {
        suffixItems.forEach((item) => {
            let itemValue = item.substring(1, item.length - 1)
            if (languages.includes(itemValue)) {
                output.language = itemValue
            } else {
                output.tags.push(itemValue.trim())
            }
        })

        let suffixStart = folderName.indexOf(suffixItems[0]) - 1
        output.title = folderName.substring(titleStart, suffixStart).trim()
    }
    else {
        output.title = folderName.substring(titleStart).trim()
    }

    output.pageCount = contents.length
    output.pages = contents

    if (fileStats) {
        output.addedDate = fileStats.birthtime.getTime()
    }

    return output
}

export function importBooks(res: Response<any, Record<string, any>>, callback: (res: Response<any, Record<string, any>>, importResult: ImportBooksResult) => void) {
    let count = 0;
    
    console.log(`Checking for books in Directory: ${imageDirectory}`)
    readdir(imageDirectory, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        const bookData: FolderJSON[] = []
        files.forEach((file) => {
            let json = getBookData(file)
            if (json) {
                bookData.push(json)
            }
        })
        
        let dbrows: ClientBook[] = [];
        bookData.forEach((bookJson) => {
            let addResult = bookDatabase.addBook(bookJson)
            if (addResult) {
                if (addResult.lastInsertRowid) {
                    const bookId = Number(addResult.lastInsertRowid)
                    dbrows.push(getBook(bookId))
                    count++
                }
                else if (addResult.existingRowId) {
                    const bookId = Number(addResult.existingRowId)
                    dbrows.push(getBook(bookId))
                }
            } 
        })      
        callback(res, { success: true, books: dbrows, importCount: count })
    })
}

function getBookData(file: string): FolderJSON | null {
    let fullpath = path.join(imageDirectory, file);
    let fileStats = statSync(fullpath)
    if (fileStats.isDirectory()) {
        try {
            const files = readdirSync(fullpath);
            let folderContents: string[] = [];
            files.forEach((file) => {
                folderContents.push(file);
            });
            return folderToJSON(file, folderContents, fileStats);
        } catch (err: any) {
            console.error(err)
        }
    }
    return null
}

//takes a row from the books table, converts some data from SQL format to JSON,
//and fills artists + tags with data from artist and tag tables
function fillBook(booksRow: BookRow): ClientBook {
    const book: ClientBook = {
        id: booksRow.id,
        title: booksRow.title ?? '',
        originalTitle: booksRow.originalTitle ?? '',
        folderName: booksRow.title ?? '',
        artGroup: booksRow.artGroup ?? '',
        prefix: booksRow.prefix ?? '',
        language: booksRow.language ?? '',
        pageCount: booksRow.pageCount ?? 0,
        coverIndex: booksRow.coverIndex ?? 0,
        addedDate: booksRow.addedDate ?? '',
        isFavorite: booksRow.isFavorite !== null ? booksRow.isFavorite > 0 : false,
        pages: [],
        artists: [],
        tags: [],
        hiddenPages: []
    }

    if (booksRow.pages) {
        book.pages = JSON.parse(booksRow.pages)
    }
    if (booksRow.hiddenPages) {
        book.hiddenPages = JSON.parse(booksRow.hiddenPages)
    }
    book.artists = bookDatabase.getBookArtists(booksRow.id)
    book.tags = bookDatabase.getBookTags(booksRow.id)
    return book;
}

export function getBooks(): ClientBook[] {
    console.log("/allbooks")
    let books: ClientBook[] = []
    let booksRow = bookDatabase.getBooks()
    if (!booksRow || booksRow.length < 1) {
        console.log("no books found")
        return books
    }
    booksRow.forEach(row => {
        books.push(fillBook(row))
    });
    return books
}

export function getBookPage (id: number, pageNum: number) {
    let book = bookDatabase.getBookByID(id)
    if (book && book.pages) {
        //console.log(row.title + " page " + req.params.pageNum)
        let pageList = JSON.parse(book.pages)
        if (pageNum < pageList.length && book.folderName) {
            return path.join(book.folderName, pageList[pageNum]);
        } else {
            console.log('empty folder name or page number out of range')
        }
    } else {
        console.log(`unable to fetch data for book ID: ${id}`)
    }
}

export function getBook (id: number) {
    let book = bookDatabase.getBookByID(id)
    return fillBook(book)
}

export function updateBook(id: number, newBookData: ClientBook): UpdateBookResult {
    console.log("updating book with id " + id)
    let response: UpdateBookResult = { success: false, error: "" }
    let bookData = getBook(id);
    if (newBookData.title !== bookData.title) {
        bookDatabase.setTitle(id, newBookData.title)
    }
    if (newBookData.artGroup !== bookData.artGroup) {
        bookDatabase.setArtGroup(id, newBookData.artGroup)
    }
    if (newBookData.artists && bookData.artists) {
        let artistsToAdd = newBookData.artists.filter(t => !bookData.artists.includes(t))
        let artistsToRemove = bookData.artists.filter(t => !newBookData.artists.includes(t))

        if (artistsToAdd.length) {
            let addResult = bookDatabase.addArtists(id, artistsToAdd)
            if (addResult.length === artistsToAdd.length) {
                response.success = true;
            } else {
                response.error = response.error + "Adding artists failed"
            }
        } 
        if (artistsToRemove.length) {
            let removeResult = bookDatabase.removeArtists(id, artistsToRemove)
            if (removeResult.length === artistsToRemove.length) {
                response.success = true;
            } else {
                response.error = response.error + "Adding artists failed"
            }
        }
    }
    if (newBookData.tags && bookData.tags) {
        let tagsToAdd = newBookData.tags.filter(t => !bookData.tags.includes(t))
        let tagsToRemove = bookData.tags.filter(t => !newBookData.tags.includes(t))

        if (tagsToAdd.length) {
            let addResult = bookDatabase.addTags(id, tagsToAdd)
            if (addResult.length === tagsToAdd.length) {
                response.success = true;
            } else {
                response.error = response.error + "Adding tags failed"
            }
        } 
        if (tagsToRemove.length) {
            let removeResult = bookDatabase.removeTags(id, tagsToRemove)
            if (removeResult.length === tagsToRemove.length) {
                response.success = true;
            } else {
                response.error = response.error + "Adding tags failed"
            }
        }
    }
    if (newBookData.hiddenPages && bookData.hiddenPages) {
        if (JSON.stringify(newBookData.hiddenPages) !== JSON.stringify(bookData.hiddenPages)) {
            try {
                let updateResult = bookDatabase.setHiddenPages(id, newBookData.hiddenPages)
                if (updateResult) response.success = true
            } catch (err: any) {
                response.error = response.error + err.message
            }
        }
        
    }
    if (newBookData.isFavorite !== bookData.isFavorite) {
        try {
            let updateResult = bookDatabase.setFavoriteValue(id, newBookData.isFavorite)
            if (updateResult) response.success = true
        } catch (err: any) {
            response.error = response.error + err.message
        } 
    }
    if (response.error) response.success = false
    response.book = getBook(id)
    return response
}

export function deleteBook(id: number) {
    return bookDatabase.deleteBook(id)
}

export function createCollection(req: CreateCollectionRequest) {
    return bookDatabase.createCollection(
        req.name, 
        req.books, 
        req.coverBookId
    )
}

export function getCollections() {
    return bookDatabase.getAllCollections()
}