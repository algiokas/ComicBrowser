import { createContext } from "react";
import type { Actor } from "../../types/actor";
import type { IVideoSearchQuery } from "../../types/searchQuery";
import type { Video } from "../../types/video";
import type { VideoSource } from "../../types/videoSource";
import { VideosViewMode } from "../../util/enums";
import type { FileWithData } from "./gallery/sourceDetail";
import type { VideoTag, ActorTag } from "../../types/tags";

export type VideosAppState = {
    galleryPageSize: number,
    allVideos: Video[],
    allActors: Actor[],
    allSources: VideoSource[],
    allVideoTags: VideoTag[],
    allActorTags: ActorTag[],
    viewMode: VideosViewMode,
    currentVideo: Video | null,
    currentSearchQuery: IVideoSearchQuery,
    showLoadingModal: boolean,
    loadingModalText: string,

    videoListingPage: number,
    actorListingPage: number,
}

export type VideosAppHandlers = {
    watchVideo: (video: Video) => void,
    viewListing: () => void,
    viewActors: () => void,
    viewCurrentVideo: () => void,
    viewSearchResults: (query?: IVideoSearchQuery) => void,
    setVideoListingPage: (n: number) => void,
    setActorListingPage: (n: number) => void,
    setLoadingModal: (show: boolean, text?: string) => void

    updateVideo: (video: Video) => Promise<void>,
    deleteVideo: (videoId: number) => Promise<void>,
    setThumbnailToTime: (videoId: number, timeMs: number) => Promise<void>,
    updateActor: (actor: Actor) => void,
    generateImageForActor: (videoId: number, actorId: number, timeMs: number) => void,
    uploadSourceImage: (sourceId: number, imageSize: 'small' | 'large', fileData: FileWithData) => void,
}

export const VideosAppContext = createContext<VideosAppState & VideosAppHandlers>({
    galleryPageSize: 0,
    allVideos: [],
    allActors: [],
    allSources: [],
    allVideoTags: [],
    allActorTags: [],
    viewMode: VideosViewMode.Loading,
    currentVideo: null,
    currentSearchQuery: {},
    showLoadingModal: false,
    loadingModalText: '',
    videoListingPage: 0,
    actorListingPage: 0,

    //sync
    watchVideo: () => { },
    viewListing: () => { },
    viewActors: () => { },
    viewCurrentVideo: () => { },
    viewSearchResults: () => { },
    setVideoListingPage: () => { },
    setActorListingPage: () => { },
    setLoadingModal: () => { },

    //async
    updateVideo: async () => { },
    deleteVideo: async () => { },
    setThumbnailToTime: async () => { },
    updateActor: async () => { },
    generateImageForActor: async () => { },
    uploadSourceImage: async () => { },
})