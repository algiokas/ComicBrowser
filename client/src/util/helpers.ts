import type { Actor } from "../types/actor";
import type { Book } from "../types/book"
import type { Slideshow } from "../types/slideshow";
import type { VideosAppTag } from "../types/tags";
import type { Video } from "../types/video";
import type { VideoSource } from "../types/videoSource";

export function GetCoverPath(book: Book): string {
    const basePath = import.meta.env.VITE_API_BASE_URL
    if (basePath) {
        return basePath + `/books/${book.id}/page/0`
    }
    console.error(`Books base path env var not set`)
    return ''
}

export function GetPagePathByID(bookId: number, pageNum: number): string {
    const basePath = import.meta.env.VITE_API_BASE_URL
    if (basePath) {
        return basePath + `/books/${bookId}/page/${pageNum}`
    }
    console.error(`Books base path env var not set`)
    return ''
}

async function shortNumericHash(input: string, digits = 8): Promise<number> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(buffer);

    let num = 0;
    for (let i = 0; i < 6; i++) {
        num = (num << 8) | bytes[i];
    }
    return num % (10 ** digits);
}

export async function getVideoThumbnailUrl(video: Video): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const versionHash = await shortNumericHash(video.thumbnailId)
    return `${apiBaseUrl}/videos/thumbnail/${video.id}?v=${versionHash}`
}

export async function getActorImageUrl(actor: Actor): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const versionHash = await shortNumericHash(actor.imageFile)
    return `${apiBaseUrl}/actors/${actor.id}/image?v=${versionHash}`
}

export async function getSourceImageUrl(source: VideoSource, small?: boolean): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const versionHash = await shortNumericHash(small ? source.imageFileSmall : source.imageFileLarge)
    return `${apiBaseUrl}/videos/sources/${source.id}/image${small ? 'small' : 'large'}?v=${versionHash}`
}

export async function getTagImageUrl(tag: VideosAppTag): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    if (!tag.imageFile) return ''
    const versionHash = await shortNumericHash(tag.imageFile)
    const tagTypeSegment = tag.tagType + "s"
    return `${apiBaseUrl}/${tagTypeSegment}/tags/thumbnail/${tag.id}?v=${versionHash}`
}

export function GetPagePath(book: Book, pageNum: number): string {
    if (!book) {
        console.log("GetPagePath - book cannot be null")
    }
    if (!book.pages || book.pageCount < 1) {
        console.log("GetPagePath - book contains no pages (book id: " + book.id + ")")
    }
    if (pageNum < 0 || pageNum >= book.pageCount) {
        console.log("GetPagePath - page number out of range (book id: " + book.id + ")")
    }
    return GetPagePathByID(book.id, pageNum)
}

export function getSlideshowBookByPage(slideshow: Slideshow, pageNum: number): Book | null {
    const books = slideshow.books
    if (books.length < 1) {
        return null
    }
    if (books.length < 2) {
        return books[0]
    }
    let pageNumInternal = pageNum
    for (let i = 0; i < books.length; i++) {
        if (pageNumInternal < books[i].pageCount) {
            return books[i]
        }
        else {
            pageNumInternal = pageNumInternal - books[i].pageCount
        }
    }
    return null
}

export function GetPagePathMulti(books: Book[], pageNum: number): string {
    if (books.length < 2) {
        return GetPagePath(books[0], pageNum)
    }
    let pageNumInternal = pageNum
    for (let i = 0; i < books.length; i++) {
        if (pageNumInternal < books[i].pageCount) {
            return GetPagePath(books[i], pageNumInternal)
        }
        else {
            pageNumInternal = pageNumInternal - books[i].pageCount
        }
    }
    console.log(`GetPagePathMulti - page ${pageNum} not found in books`)
    return ""
}

export function GetRelativePage(books: Book[], bookNum: number, pageNum: number): number {
    if (bookNum < 1) return pageNum
    let prevBookPages = 0
    for (let i = 0; i < bookNum && books.length; i++) {
        prevBookPages += books[i].pageCount
    }
    return prevBookPages + pageNum
}

export function getBookAuthor(book: Book) {
    if (book.artGroup)
        return book.artGroup
    if (book.artists && book.artists.length > 0)
        return book.artists[0]
    return ""
}

//compare two arrays with elements that can be compared using === 
//returns true if arrays are identical, false otherwise
//arrays are compared in order, so arrays with identical elements but different order will return false
export function scalarArrayCompare(array1: any[], array2: any[]): boolean {
    if (!array1 && !array2) return true
    if (!array1 || !array2) return false
    return array1.length === array2.length && array1.every(function (value, index) { return value === array2[index] })
}

export function getAlphabet(lowerCase = false) {
    let startChar = lowerCase ? 97 : 65
    return [...Array(26).keys()].map((n) => String.fromCharCode(startChar + n))
}

export function isAlphanumeric(str: string): boolean {
    return !(/\W/.test(str));
}

export function filterAlphanumeric(str: string): string {
    return str.replace(/\W/g, '')
}