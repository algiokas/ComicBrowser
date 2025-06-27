import React, { useContext, useState } from "react";
import type IActor from "../../../interfaces/actor";
import type IVideo from "../../../interfaces/video";
import PlayerSidebar, { type PlayerSidebarProps } from "./player-sidebar";
import { VideosAppContext } from "../videosAppContext";

export interface PlayerProps {
    videoFavoriteClick?: (video: IVideo) => void,
    actorFavoriteClick?: (actor: IActor) => void
}

const Player = (props: PlayerProps) => {
    const appContext = useContext(VideosAppContext)
    const videoRef = React.createRef<HTMLVideoElement>()
    const [showEditModal, setShowEditModal] = useState<boolean>(false)

    const videoUrl = () => {
        if (!appContext.currentVideo) return ""
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
        return `${apiBaseUrl}/videos/${appContext.currentVideo.id}`
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
            <div className={`player-inner ${(appContext.currentVideo?.isFavorite) ? 'favorite' : ''}`}>
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