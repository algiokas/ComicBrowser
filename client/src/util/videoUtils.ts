import type IActor from "../interfaces/actor";
import type { IVideoSearchQuery } from "../interfaces/searchQuery";
import type IVideo from "../interfaces/video";
import { getActorImageUrl, getVideoThumbnailUrl } from "./helpers";

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
    if (videoJson.addedDate) {
        newVideo.addedDate = new Date(videoJson.addedDate)
    }
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