import IBook from "./book"

export default interface ISlideshow {
    pageCount: number,
    books: IBook[]
}

export function 