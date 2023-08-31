const imageBaseUrl = "http://localhost:9000/api/page/"

export function GetCoverPath(book) {
    return imageBaseUrl + book.id + "/0"
}

export function GetPagePath(book, pageNum) {
    if (!book) {
        console.log("GetPagePath - book cannot be null")
    }
    if (!book.pages || book.pageCount < 1) {
        console.log("GetPagePath - book contains no pages (book id: " + book.id + ")")
    }
    if (pageNum < 0 || pageNum >= book.pageCount) {
        console.log("GetPagePath - page number out of range (book id: " + book.id + ")")
    }
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
    if (book.artGroup) 
        return book.artGroup
    if (book.artists && book.artists.length > 0) 
        return book.artists[0]
    return ""
}

export function safeBind(caller, f) {
    let errString = "safeBind: Failed to bind function for " + typeof caller
    if (f) {
        try {
            let bound = f.bind(caller)
            return bound
        } catch (err) {
            console.log(err)
            return () => { console.error(errString) }
        }
    }
    console.error(errString)
    return () => { console.error(errString) }
}

//compare two arrays with elements that can be compared using === 
//returns true if arrays are identical, false otherwise
//arrays are compared in order, so arrays with identical elements but different order will return false
export function scalarArrayCompare(array1, array2) {
    if (!array1 && !array2) return true
    if (!array1 || !array2) return false
    return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})
}

export function getAlphabet(lowerCase = false) {
    let startChar = lowerCase ? 97 : 65
    return [...Array(26).keys()].map((n) => String.fromCharCode(startChar + n))
}