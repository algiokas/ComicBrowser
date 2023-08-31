import IBook from "../interfaces/book"

const imageBaseUrl = "http://localhost:9000/api/page/"

export function GetCoverPath(book : IBook) : string {
    return imageBaseUrl + book.id + "/0"
}

export function GetPagePath(book : IBook, pageNum : number) : string {
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

export function GetPagePathMulti(books : IBook[], pageNum : number) : string {
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
    return ""
}

export function getBookAuthor(book: IBook) {
    if (book.artGroup) 
        return book.artGroup
    if (book.artists && book.artists.length > 0) 
        return book.artists[0]
    return ""
}

//compare two arrays with elements that can be compared using === 
//returns true if arrays are identical, false otherwise
//arrays are compared in order, so arrays with identical elements but different order will return false
export function scalarArrayCompare(array1: any[], array2: any[]) {
    if (!array1 && !array2) return true
    if (!array1 || !array2) return false
    return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})
}

export function getAlphabet(lowerCase = false) {
    let startChar = lowerCase ? 97 : 65
    return [...Array(26).keys()].map((n) => String.fromCharCode(startChar + n))
}