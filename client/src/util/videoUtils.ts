import type IActor from "../interfaces/actor";
import type { IVideoSearchQuery } from "../interfaces/searchQuery";
import type IVideo from "../interfaces/video";
import { filterAlphanumeric, getActorImageUrl, getVideoThumbnailUrl, isAlphanumeric } from "./helpers";

export const getEmptyQuery = (): IVideoSearchQuery => {
    return {
        filled: false,
        actor: '',
        source: '',
        tag: '',
    }
}

export const videoFromJson = (videoJson: any): IVideo => {
    let newVideo = videoJson as IVideo
    if (!newVideo.actors) newVideo.actors = []
    if (!newVideo.tags) newVideo.tags = []
    if (videoJson.addedDate) {
        newVideo.addedDate = new Date(videoJson.addedDate)
    }
    newVideo.searchTerms = generateVideoSearchTerms(newVideo)
    return newVideo
}

export const videosFromJson = (videosJson: any): IVideo[] => {
    let videoList: IVideo[] = []
    if (!videosJson || videosJson.length < 1) console.log("videosFromJson - no videos in input")
    for (const v of videosJson) {
        videoList.push(videoFromJson(v))
    }
    return videoList
}

export const getActorImageUrlWithFallback = async (actor: IActor, videos: IVideo[]): Promise<string> => {
    if (actor.imageFile) return getActorImageUrl(actor)
    let matchingVideos = videos.filter((v) => v.actors.some((a) => a.id === actor.id) && v.thumbnailId)
    if (matchingVideos.length > 0) return getVideoThumbnailUrl(matchingVideos[0])
    return ""
}

export const actorFromJson = async (actorJson: any, videos: IVideo[]): Promise<IActor> => {
    let newActor = actorJson as IActor
    newActor.isFavorite = actorJson.isFavorite != null && actorJson.isFavorite > 0
    newActor.videos = videos.filter((v: any) => v.actors.some((a: any) => a.id === newActor.id)).map((v: any) => v.id)
    newActor.imageUrl = await getActorImageUrlWithFallback(newActor, videos)
    return newActor
}

export const actorsFromJson = async (actorJson: any, videoJson: IVideo[]): Promise<IActor[]> => {
    let actorList: IActor[] = []
    if (!actorJson || actorJson.length < 1) console.log("actorsFromJson - no actors in input")
    for (const a of actorJson) {
        const newActor = await actorFromJson(a, videoJson)
        actorList.push(newActor)
    }
    return actorList
}

const getComponentTerms = (str: string): string[] => {
    const terms: string[] = []
    terms.push(str)
    if (str.includes(' ')) {
        str.split(' ').forEach(s => {
            if (s.trim().length > 0) {
                terms.push(s.trim())
            }
        })
    }
    return terms
}

const generateVideoSearchTerms = (video: IVideo): string[] => {
    const terms = new Set<string>();

    terms.add(video.id.toString())
    getComponentTerms(video.title).forEach(t => { terms.add(t) })
    if (video.actors) {
        video.actors.forEach(a => {
            getComponentTerms(a.name).forEach(t => { terms.add(t) })
        })
    }
    if (video.tags) {
        video.tags.forEach(tag => {
            getComponentTerms(tag).forEach(t => { terms.add(t) })
        })
    }
    if (video.source) {
        getComponentTerms(video.source.name).forEach(t => { terms.add(t) })
    }

    const termsList = [...terms].filter(s => s).map(s => s.toLowerCase().trim()).filter(s => s.length > 0)
    termsList.forEach(t => {
        if (t) {
            if (t.includes('_')) {
                t.split('_').forEach(x => {
                    if (!termsList.includes(x)) termsList.push(x)
                })
            }
            if (!isAlphanumeric(t)) {
                const filtered = filterAlphanumeric(t)
                if (!termsList.includes(filtered)) termsList.push(filtered)
            }
        }
    })
    return termsList
}