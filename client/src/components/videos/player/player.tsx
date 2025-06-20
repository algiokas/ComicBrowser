import React, { useState } from "react";
import type IActor from "../../../interfaces/actor";
import type { IVideoSearchQuery } from "../../../interfaces/searchQuery";
import type IVideo from "../../../interfaces/video";
import type IVideoSource from "../../../interfaces/videoSource";
import PlayerSidebar, { type PlayerSidebarProps } from "./player-sidebar";

export interface PlayerProps {
    video: IVideo | null,
    allActors: IActor[],
    allSources: IVideoSource[],

    updateVideo(video: IVideo): void,
    deleteVideo(videoId: number): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    getActorImageUrl(actor: IActor): string,
    setThumbnailToTime(videoId: number, timeMs: number): void,
    generateImageForActor(videoId: number, actorId: number, timeMs: number): void,
    videoFavoriteClick?: (video: IVideo) => void,
    actorFavoriteClick?: (actor: IActor) => void
}

const Player = (props: PlayerProps) => {
    const videoRef = React.createRef<HTMLVideoElement>()
    const [showEditModal, setShowEditModal] = useState<boolean>(false)

    const videoUrl = () => {
        if (!props.video) return ""
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        return `${apiBaseUrl}/videos/${props.video.id}`
    }

    const toggleEditModal = (): void => {
        setShowEditModal(!showEditModal)
    }

    const sidebarProps: PlayerSidebarProps = {
        ...props,
        videoRef: videoRef,
        showEditModal: showEditModal,
        toggleEditModal: toggleEditModal
    }

    return (
        <div className="player-container">
            <div className="player-inner">
                <div className="player-video-container">
                    <div className="player-video">
                        <video muted preload="auto" ref={videoRef} controls={true} src={videoUrl()} width="100%" height="auto"></video>
                    </div>
                </div>
                <PlayerSidebar {...sidebarProps}/>
            </div>
        </div>

    )
}

export default Player