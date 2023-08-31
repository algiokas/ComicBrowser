export default interface IBook{
    id: number,
    title: number,
    folderName: number,
    artGroup: number,
    artists: string[],
    tags: string[],
    prefix: number,
    language: number,
    pageCount: number,
    coverIndex: number,
    pages: number[],
    addedDate: Date,
    hiddenPages: number[]
    isFavorite: boolean
}