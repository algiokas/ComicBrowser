export type Book = {
    id: number,
    title: string,
    originalTitle: string,
    folderName: string,
    artGroup: string,
    artists: string[],
    tags: string[],
    prefix: string,
    language: string,
    pageCount: number,
    coverIndex: number,
    pages: string[],
    addedDate: Date,
    hiddenPages: number[]
    isFavorite: boolean,
    searchTerms: string[]
}