const imageBaseUrl = "http://localhost:9000/img/"

export function GetCoverPath(book) {
    return imageBaseUrl + book.folderName + "/" + book.cover
}

export function GetPagePath(book, pageNum) {
    if (!book) {
        console.log("GetPagePath - book cannot be null")
    }
    if (pageNum < 0 || pageNum >= book.pageCount) {
        console.log("GetPagePath - page number out of range")
    }
    let fname = book.pages[pageNum]
    return imageBaseUrl + book.folderName + "/" + fname;
}

export function GetPagePathMulti(books, pageNum) {
    if (books.length < 2) {
        return GetPagePath(books[0], pageNum)
    }

    let pageNumInternal = pageNum
    books.forEach((book) => {
        if (pageNumInternal < book.pageCount){
            return GetPagePath(book, pageNumInternal)
        }
        else {
            pageNumInternal = pageNumInternal - book.pageCount
        }
    })
    console.log(`GetPagePathMulti - page ${pageNum} not found in books`)
}