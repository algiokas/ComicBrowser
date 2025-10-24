import type { Book } from "./book"

export type Slideshow = {
    id: number | null,
    name: string,
    pageCount: number,
    books: Book[]
}

export type Collection = Slideshow & {
    coverBookId: number,
    coverPageId: number,
    coverImage: string
}