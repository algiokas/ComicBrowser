import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import { ActorsSortOrder, VideosSortOrder, VideosViewMode } from "../../util/enums";
import ActorGallery from "./gallery/actorGallery";
import SourceGallery from "./gallery/sourceGallery";
import VideoGallery from "./gallery/videoGallery";
import LoadingView from "./loadingView";
import Player from "./player/player";

interface MultiViewProps {
    viewMode: VideosViewMode;
    galleryPageSize: number;
    currentSearchQuery: IVideoSearchQuery;
}

const MultiView = (props: MultiViewProps) => {
    switch (props.viewMode) {
        case VideosViewMode.Listing:
            return (
                <VideoGallery
                    pageSize={props.galleryPageSize}
                    showFilters={true} />
            )
        case VideosViewMode.Actors:
            return (
                <ActorGallery sortOrder={ActorsSortOrder.Favorite} />
            )
        case VideosViewMode.Sources:
            return (
                <SourceGallery />
            )
        case VideosViewMode.Player:
            return (
                <Player />
            )
        case VideosViewMode.SearchResults:
            return (
                <VideoGallery
                    sortOrder={VideosSortOrder.Favorite}
                    query={props.currentSearchQuery}
                    pageSize={props.galleryPageSize} />
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