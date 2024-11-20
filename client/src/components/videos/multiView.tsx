import React, { Component } from "react";
import LoadingView from "./loadingView";
import Player from "./player";
import { ActorsSortOrder, VideosSortOrder, VideosViewMode } from "../../util/enums";
import { IVideoSearchQuery }from "../../interfaces/searchQuery";
import { VideosAppState } from "./videosApp";
import IVideo from "../../interfaces/video";
import VideoGallery from "./gallery/videoGallery";
import ActorGallery from "./gallery/actorGallery";
import IActor from "../../interfaces/actor";

interface MultiViewProps extends VideosAppState {
    watchVideo(Video: IVideo): void,
    viewListing(): void,
    viewCurrentVideo(): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    updateVideo(Video : IVideo): void,
    deleteVideo(VideoId : number) : void,
    importVideos(): void,
    setThumbnailToTime(videoId: number, timeMs: number): void,
    getActorImageUrl(actor: IActor): string,
    generateImageForActor(videoId: number, actorId: number, timeMs: number): void
}

interface MultiViewState{}

class MultiView extends Component<MultiViewProps, MultiViewState> {
    render() {
        const videoGalleryHandlers = {
            watchVideo: this.props.watchVideo,
            updateVideo: this.props.updateVideo,
            viewSearchResults: this.props.viewSearchResults,
            getActorImageUrl: this.props.getActorImageUrl
        }

        const actorGalleryHandlers = {
            viewSearchResults: this.props.viewSearchResults,
            getActorImageUrl: this.props.getActorImageUrl
        }

        const playerHandlers = {
            updateVideo: this.props.updateVideo,
            deleteVideo: this.props.deleteVideo,
            viewSearchResults: this.props.viewSearchResults,
            getActorImageUrl: this.props.getActorImageUrl,
            setThumbnailToTime: this.props.setThumbnailToTime,
            generateImageForActor: this.props.generateImageForActor
        }

        switch(this.props.viewMode) {
            case VideosViewMode.Listing:
                return (
                    <VideoGallery 
                        pageSize={this.props.galleryPageSize}
                        allItems={this.props.allVideos}
                        showFilters={true}
                        {...videoGalleryHandlers}/>
                )
            case VideosViewMode.SearchResults:
                return (
                    <VideoGallery 
                        sortOrder={VideosSortOrder.Title}
                        query={this.props.currentSearchQuery}
                        pageSize={this.props.galleryPageSize}
                        allItems={this.props.allVideos}
                        {...videoGalleryHandlers}/>
                )
            case VideosViewMode.Actors:
                return (
                    <ActorGallery
                        sortOrder={ActorsSortOrder.NumVideos}
                        pageSize={this.props.galleryPageSize}
                        allItems={this.props.allActors}
                        {...actorGalleryHandlers}
                    />
                )
            case VideosViewMode.Player: 
                return (
                    <Player video={this.props.currentVideo} {...playerHandlers}></Player>
                )
            case VideosViewMode.Loading:
                return (
                    <LoadingView></LoadingView>
                )           
            default:
                console.log("INVALID VIEWMODE")
                return(<p>VIEWMODE ERROR</p>)
        }
    }
}

export default MultiView