import React, { Component } from "react";
import LoadingView from "./loadingView";
import Player from "./player/player";
import { ActorsSortOrder, VideosSortOrder, VideosViewMode } from "../../util/enums";
import { IVideoSearchQuery } from "../../interfaces/searchQuery";
import { VideosAppState } from "./videosApp";
import IVideo from "../../interfaces/video";
import VideoGallery from "./gallery/videoGallery";
import ActorGallery from "./gallery/actorGallery";
import IActor from "../../interfaces/actor";
import SourceGallery from "./gallery/sourceGallery";

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
    getActorImageUrl(actor: IActor): string,
    generateImageForActor(videoId: number, actorId: number, timeMs: number): void
}

const MultiView = (props: MultiViewProps) => {
    const videoGalleryHandlers = {
        watchVideo: props.watchVideo,
        updateVideo: props.updateVideo,
        updateActor: props.updateActor,
        viewSearchResults: props.viewSearchResults,
        getActorImageUrl: props.getActorImageUrl
    }

    const actorGalleryHandlers = {
        viewSearchResults: props.viewSearchResults,
        getActorImageUrl: props.getActorImageUrl,
        updateActor: props.updateActor
    }

    const sourceGalleryHandlers = {
        viewSearchResults: props.viewSearchResults
    }

    const playerHandlers = {
        updateVideo: props.updateVideo,
        deleteVideo: props.deleteVideo,
        viewSearchResults: props.viewSearchResults,
        getActorImageUrl: props.getActorImageUrl,
        setThumbnailToTime: props.setThumbnailToTime,
        generateImageForActor: props.generateImageForActor
    }

    switch (props.viewMode) {
        case VideosViewMode.Listing:
            return (
                <VideoGallery
                    pageSize={props.galleryPageSize}
                    allItems={props.allVideos}
                    showFilters={true}
                    {...videoGalleryHandlers} />
            )
        case VideosViewMode.Actors:
            return (
                <ActorGallery
                    sortOrder={ActorsSortOrder.Favorite}
                    pageSize={props.galleryPageSize}
                    allItems={props.allActors}
                    {...actorGalleryHandlers}
                />
            )
        case VideosViewMode.Sources:
            return (
                <SourceGallery
                    pageSize={props.galleryPageSize}
                    allItems={props.allSources}
                    {...sourceGalleryHandlers} />
            )
        case VideosViewMode.Player:
            return (
                <Player
                    video={props.currentVideo}
                    allActors={props.allActors}
                    allSources={props.allSources}
                    {...playerHandlers} />
            )
        case VideosViewMode.SearchResults:
            return (
                <VideoGallery
                    sortOrder={VideosSortOrder.Title}
                    query={props.currentSearchQuery}
                    pageSize={props.galleryPageSize}
                    allItems={props.allVideos}
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