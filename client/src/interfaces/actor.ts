export default interface IActor {
    id: number,
    name: string,
    imageFile: string,
    imageFallbackVideoId: number,
    isFavorite: boolean,
    videos: number[]
}