import type { ActorTag } from "./tags"

export type Actor = {
    id: number,
    name: string,
    imageFile: string,
    imageFallbackVideoId: number,
    isFavorite: boolean,  
    imageUrl: string,
    birthYear: number,
    tags: ActorTag[]
}
