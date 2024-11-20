import IActor from "./actor";
import IVideoSource from "./videoSource";

export default interface IVideo {
    id: number,
    title: string,
    originalTitle: string,
    filePath: string,
    source: IVideoSource,
    actors: IActor[],
    tags: string[],
    isFavorite: boolean,
    addedDate: Date,
    thumbnailId: string
}