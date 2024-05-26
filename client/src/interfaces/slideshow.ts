import IBook from "./book"

export default interface ISlideshow {
    id: number | null,
    name: string,
    pageCount: number,
    books: IBook[]
}