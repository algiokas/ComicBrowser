import type { Actor } from "../types/actor";
import type { FileWithData } from "../types/fileWithData";
import type { ActorTag, VideoTag } from "../types/tags";
import type { Video } from "../types/video";
import type { VideoSource } from "../types/videoSource";
import type { TagType } from "../util/enums";
import { actorFromJson, actorsFromJson, videoFromJson, videosFromJson } from "../mappers/videoMappers";
import { apiDelete, apiGet, apiPostJson, apiPostRaw } from "./apiClient";

export async function fetchVideos(): Promise<Video[]> {
    return videosFromJson(await apiGet('/videos'))
}

export async function fetchVideoTags(): Promise<VideoTag[]> {
    const data = await apiGet('/videos/tags')
    return data.map((t: Omit<VideoTag, 'tagType'>) => ({ ...t, tagType: 'video' } as VideoTag))
}

export async function fetchActorTags(): Promise<ActorTag[]> {
    const data = await apiGet('/actors/tags')
    return data.map((t: Omit<ActorTag, 'tagType'>) => ({ ...t, tagType: 'actor' } as ActorTag))
}

export async function fetchActors(videos: Video[]): Promise<Actor[]> {
    return actorsFromJson(await apiGet('/actors'), videos)
}

export async function fetchSources(): Promise<VideoSource[]> {
    const data = await apiGet('/videos/sources')
    return data.map((s: any) => s as VideoSource)
}

export async function updateVideo(video: Video): Promise<Video | null> {
    const data = await apiPostJson(`/videos/${video.id}/update`, video)
    return data.success ? videoFromJson(data.video) : null
}

export async function updateActor(actor: Actor, allVideos: Video[]): Promise<Actor | null> {
    const data = await apiPostJson(`/actors/${actor.id}/update`, actor)
    return data.success ? await actorFromJson(data.actor, allVideos) : null
}

export async function deleteVideo(videoId: number): Promise<boolean> {
    const data = await apiDelete(`/videos/${videoId}`)
    return data.changes > 0
}

export async function importVideos(): Promise<Video[] | null> {
    const data = await apiGet('/videos/import')
    return data ? videosFromJson(data.videos) : null
}

export async function generateVideoThumbnail(videoId: number, timeMs: number): Promise<{ id: number, thumbnailId: string } | null> {
    const data = await apiPostJson(`/videos/thumbnail/${videoId}/generate/${timeMs}`)
    return data.success ? data.video : null
}

export async function generateActorImage(videoId: number, actorId: number, timeMs: number): Promise<{ id: number, imageFile: string } | null> {
    const data = await apiPostJson(`/actors/${actorId}/imagefromvideo`, { videoId, timeMs })
    return data.success ? data.actor : null
}

export async function generateTagImage(tagId: number, tagType: TagType, videoId: number, timeMs: number): Promise<string | null> {
    const tagTypeSegment = `${tagType.toLowerCase()}s`
    const data = await apiPostJson(`/${tagTypeSegment}/tags/thumbnail/${tagId}/generate/${videoId}/${timeMs}`)
    if (!data.success) return null
    return tagType === 'Video' ? data.videoTag.imageFile : data.actorTag.imageFile
}

export async function uploadSourceImage(sourceId: number, imageSize: 'small' | 'large', fileData: FileWithData): Promise<VideoSource | null> {
    const data = await apiPostRaw(`/videos/upload/sourceimage/${sourceId}/${imageSize}`, fileData.file.type, fileData.data)
    return data.success ? (data.source as VideoSource) : null
}
