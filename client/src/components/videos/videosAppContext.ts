import { createContext } from "react";
import type IActor from "../../interfaces/actor";
import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import type IVideo from "../../interfaces/video";
import type IVideoSource from "../../interfaces/videoSource";
import { VideosViewMode } from "../../util/enums";
import type { FileWithData } from "./gallery/sourceDetail";

export type VideosAppState = {
    galleryPageSize: number,
    allVideos: IVideo[],
    allActors: IActor[],
    allSources: IVideoSource[],
    viewMode: VideosViewMode,
    currentVideo: IVideo | null,
    currentSearchQuery: IVideoSearchQuery,
    showLoadingModal: boolean,
    loadingModalText: string,

    videoListingPage: number,
    actorListingPage: number,
}

export type VideosAppHandlers = {
    watchVideo: (video: IVideo) => void,
    viewListing: () => void,
    viewActors: () => void,
    viewCurrentVideo: () => void,
    viewSearchResults: (query?: IVideoSearchQuery) => void,
    setVideoListingPage: (n: number) => void,
    setActorListingPage: (n: number) => void,

    updateVideo: (video: IVideo) => Promise<void>,
    deleteVideo: (videoId: number) => Promise<void>,
    setThumbnailToTime: (videoId: number, timeMs: number) => Promise<void>,
    updateActor: (actor: IActor) => void,
    generateImageForActor: (videoId: number, actorId: number, timeMs: number) => void,
    uploadSourceImage: (sourceId: number, imageSize: 'small' | 'large', fileData: FileWithData) => void,
}

export const VideosAppContext = createContext<VideosAppState & VideosAppHandlers>({
    galleryPageSize: 0,
    allVideos: [],
    allActors: [],
    allSources: [],
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

    //async
    updateVideo: async () => { },
    deleteVideo: async () => { },
    setThumbnailToTime: async () => { },
    updateActor: async () => { },
    generateImageForActor: async () => { },
    uploadSourceImage: async () => { },
})