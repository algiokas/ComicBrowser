export default interface IBook{
    id: number,
    title: string,
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
    isFavorite: boolean
}