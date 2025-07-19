export default interface IActor {
    id: number,
    name: string,
    imageFile: string,
    imageFallbackVideoId: number,
    isFavorite: boolean,  
    imageUrl: string,
    birthYear: number
    videos: number[],
    tags: IActorTag[]
}

export interface IActorTag {
    id: number,
    name: string
}