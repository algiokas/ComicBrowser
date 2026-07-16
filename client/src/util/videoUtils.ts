import type { Actor } from "../types/actor";
import type { IVideoSearchQuery } from "../types/searchQuery";
import type { Video } from "../types/video";

export const getEmptyQuery = (): IVideoSearchQuery => {
    return {
        filled: false,
        actor: '',
        source: '',
        tag: '',
    }
}

export const getActorVideoCount = (actor: Actor, allVideos: Video[]): number => {
    const actorVideos = allVideos.filter(v => v.actors.some(a => a.id === actor.id))
    return actorVideos.length
}

export const getActorAge = (actor: Actor): number => {
    const currentYear = new Date().getFullYear()
    return currentYear - actor.birthYear
}
