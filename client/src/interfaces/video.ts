import type IActor from "./actor";
import type IVideoSource from "./videoSource";

export default interface IVideo {
    id: number,
    title: string,
    originalTitle: string,
    filePath: string,
    source: IVideoSource,
    actors: IActor[],
    tags: IVideoTag[],
    isFavorite: boolean,
    addedDate: Date,
    thumbnailId: string,
    searchTerms: string[]
}

export interface IVideoTag {
    id: number,
    name: string
}