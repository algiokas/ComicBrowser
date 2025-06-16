import type IBook from "./book"

export default interface ISlideshow {
    id: number | null,
    name: string,
    pageCount: number,
    books: IBook[]
}

export interface ICollection extends ISlideshow {
    coverBookId: number,
    coverPageId: number,
    coverImage: string
}