import type IActor from "../../interfaces/actor";
import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import type IVideo from "../../interfaces/video";
import { ActorsSortOrder, VideosSortOrder, VideosViewMode } from "../../util/enums";
import ActorGallery from "./gallery/actorGallery";
import SourceGallery from "./gallery/sourceGallery";
import VideoGallery from "./gallery/videoGallery";
import LoadingView from "./loadingView";
import Player from "./player/player";
import type { VideosAppState } from "./videosAppContext";

interface MultiViewProps extends VideosAppState {
    watchVideo(Video: IVideo): void,
    viewListing(): void,
    viewCurrentVideo(): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    updateVideo(Video: IVideo): void,
    deleteVideo(VideoId: number): void,
    importVideos(): void,
    setThumbnailToTime(videoId: number, timeMs: number): void, 
    updateActor(actor: IActor): void,
    generateImageForActor(videoId: number, actorId: number, timeMs: number): void,
    uploadSourceImage(sourceId: number, imageSize: 'small' | 'large', fileData: any): void
}

const MultiView = (props: MultiViewProps) => {
    const videoGalleryHandlers = {
        watchVideo: props.watchVideo,
        updateVideo: props.updateVideo,
        updateActor: props.updateActor,
        viewSearchResults: props.viewSearchResults,
        uploadSourceImage: props.uploadSourceImage
    }

    const actorGalleryHandlers = {
        viewSearchResults: props.viewSearchResults,
        updateActor: props.updateActor
    }

    const sourceGalleryHandlers = {
        viewSearchResults: props.viewSearchResults
    }

    const playerHandlers = {
        updateVideo: props.updateVideo,
        deleteVideo: props.deleteVideo,
        viewSearchResults: props.viewSearchResults,
        setThumbnailToTime: props.setThumbnailToTime,
        generateImageForActor: props.generateImageForActor,
        uploadSourceImage: props.uploadSourceImage
    }

    switch (props.viewMode) {
        case VideosViewMode.Listing:
            return (
                <VideoGallery
                    pageSize={props.galleryPageSize}
                    showFilters={true}
                    {...videoGalleryHandlers} />
            )
        case VideosViewMode.Actors:
            return (
                <ActorGallery sortOrder={ActorsSortOrder.Favorite} {...actorGalleryHandlers}
                />
            )
        case VideosViewMode.Sources:
            return (
                <SourceGallery {...sourceGalleryHandlers} />
            )
        case VideosViewMode.Player:
            return (
                <Player {...playerHandlers} />
            )
        case VideosViewMode.SearchResults:
            return (
                <VideoGallery
                    sortOrder={VideosSortOrder.Favorite}
                    query={props.currentSearchQuery}
                    pageSize={props.galleryPageSize}
                    {...videoGalleryHandlers} />
            )
        case VideosViewMode.Loading:
            return (
                <LoadingView></LoadingView>
            )
        default:
            console.log("INVALID VIEWMODE")
            return (<p>VIEWMODE ERROR</p>)
    }
}

export default MultiView