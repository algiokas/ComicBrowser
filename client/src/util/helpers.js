const imageBaseUrl = "http://localhost:9000/api/page/"

export function GetCoverPath(book) {
    return imageBaseUrl + book.id + "/0"
}

export function GetPagePath(book, pageNum) {
    if (!book) {
        console.log("GetPagePath - book cannot be null")
    }
    if (pageNum < 0 || pageNum >= book.pageCount) {
        console.log("GetPagePath - page number out of range")
    }
    if (!book.pages) {
        console.log(book)
    }
    let fname = book.pages[pageNum]
    return imageBaseUrl + book.id + "/" + pageNum;
}

export function GetPagePathMulti(books, pageNum) {
    if (books.length < 2) {
        return GetPagePath(books[0], pageNum)
    }
    let pageNumInternal = pageNum
    for (let i =0; i < books.length; i++) {
        if (pageNumInternal < books[i].pageCount){
            return GetPagePath(books[i], pageNumInternal)
        }
        else {
            pageNumInternal = pageNumInternal - books[i].pageCount
        }
    }
    console.log(`GetPagePathMulti - page ${pageNum} not found in books`)
}

export function slideshowToJSON(slideshow) {
    let output = {}
    if (!slideshow || !slideshow.books) {
        return output
    }
    
    output.ids = slideshow.books.map((book) => {
        return book.id
    })
  
    output.titles = slideshow.books.map((book) => {
        return book.title
    })
    return output
}

export function getBookAuthor(book) {
    if (book.artGroup || (book.artists && book.artists.length > 0)) {
        let author = book.artGroup
        if (!author) {
            author = book.artists[0]
        }
        return author
    }
    return "" 
}