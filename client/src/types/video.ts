import type { Actor } from "./actor"
import type { VideoTag } from "./tags"
import type { VideoSource } from "./videoSource"

export type Video = {
    id: number,
    title: string,
    originalTitle: string,
    filePath: string,
    source: VideoSource,
    actors: Actor[],
    tags: VideoTag[],
    isFavorite: boolean,
    addedDate: Date,
    thumbnailId: string,
    searchTerms: string[]
}