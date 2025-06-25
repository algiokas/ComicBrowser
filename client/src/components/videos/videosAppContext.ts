import { createContext } from "react";
import type IActor from "../../interfaces/actor";
import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import type IVideo from "../../interfaces/video";
import type IVideoSource from "../../interfaces/videoSource";
import { VideosViewMode } from "../../util/enums";

export interface VideosAppState {
    galleryPageSize: number,
    allVideos: IVideo[],
    allActors: IActor[],
    allSources: IVideoSource[],
    viewMode: VideosViewMode,
    currentVideo: IVideo | null,
    currentSearchQuery: IVideoSearchQuery,
    showLoadingModal: boolean,
    loadingModalText: string,
}

export const VideosAppContext = createContext<VideosAppState>({
    galleryPageSize: 0,
    allVideos: [],
    allActors: [],
    allSources: [],
    viewMode: VideosViewMode.Loading,
    currentVideo: null,
    currentSearchQuery: {},
    showLoadingModal: false,
    loadingModalText: '',
})