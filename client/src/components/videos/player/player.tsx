import React, { useState } from "react";
import CameraIcon from "../../../img/svg/camera.svg";
import StarsIcon from "../../../img/svg/stars.svg";
import type IActor from "../../../interfaces/actor";
import type { IVideoSearchQuery } from "../../../interfaces/searchQuery";
import type IVideo from "../../../interfaces/video";
import type IVideoSource from "../../../interfaces/videoSource";
import Modal from "../../shared/modal";
import EditPanel from "../editPanel/editPanel";

interface PlayerProps {
    video: IVideo | null,
    allActors: IActor[],
    allSources: IVideoSource[],

    updateVideo(video: IVideo): void,
    deleteVideo(videoId: number): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    getActorImageUrl(actor: IActor): string,
    setThumbnailToTime(videoId: number, timeMs: number): void
    generateImageForActor(videoId: number, actorId: number, timeMs: number): void
    videoFavoriteClick?: (video: IVideo) => void
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


    const searchActor = (a: string): void => {
        props.viewSearchResults({
            actor: a
        })
    }

    const searchSource = (g: string): void => {
        props.viewSearchResults({
            source: g
        })
    }

    const searchTag = (t: string): void => {
        props.viewSearchResults({
            tag: t
        })
    }

    const setThumbToCurrentTime = (): void => {
        if (props.video && videoRef.current) {
            let timeMs = Math.round(videoRef.current.currentTime * 1000)
            console.log('set thumbnail at ' + timeMs + 'ms')
            props.setThumbnailToTime(props.video.id, timeMs)
        }
    }

    const advanceVideoTime = (ms: number): void => {
        if (videoRef.current) {
            let currentTime = videoRef.current.currentTime
            let newTime = currentTime + (ms * 0.001)
            if (newTime < 0) newTime = 0
            videoRef.current.currentTime = newTime
        }
    }

    const toggleEditModal = (): void => {
        setShowEditModal(!showEditModal)
    }

    const generateActorImage = (e: React.MouseEvent, actor: IActor): void => {
        if (actor && props.video && videoRef.current) {
            e.stopPropagation()
            let timeMs = Math.round(videoRef.current.currentTime * 1000)
            console.log('generate actor image at ' + timeMs + 'ms')
            props.generateImageForActor(props.video.id, actor.id, timeMs)
        }
    }

    const searchHandlers = {
        searchActor: searchActor,
        searchSource: searchSource,
        searchTag: searchTag
    }
    return (
        <div className="player-container">
            <div className="player-inner">
                <div className="player-video-container">
                    <div className="player-video">
                        <video muted preload="auto" ref={videoRef} controls={true} src={videoUrl()} width="100%" height="auto"></video>
                    </div>
                </div>
                <div className="player-video-info">
                    <h3 className="player-video-info-title">{props.video?.title}</h3>
                    <span className="player-video-info-id">{props.video?.id}</span>
                    {
                        props.video && props.video.actors.length > 0 ?
                            <div className="player-video-info-actors">
                                {
                                    props.video.actors.map((actor, i) => {
                                        return (
                                            <div key={i} className="player-actor" onClick={() => searchActor(actor.name)}>
                                                <div className="player-actor-image">
                                                    <img className="actorgallery-image" src={props.getActorImageUrl(actor)} alt={`${actor.name}`}></img>
                                                </div>
                                                <div className="caption">
                                                    <div className="player-actorimagegen-icon" onClick={(e) => generateActorImage(e, actor)}>
                                                        <img className="svg-icon-favorite" src={CameraIcon.toString()} alt={"Generate image for " + actor.name}></img>
                                                    </div>
                                                    <span>{actor.name}</span>
                                                    <div className="player-favorite-icon">
                                                        {
                                                            actor.isFavorite ?
                                                                <img className="svg-icon-favorite" src={StarsIcon.toString()} alt="remove from favorites"></img>
                                                                :
                                                                <img className="svg-icon-disabled test" src={StarsIcon.toString()} alt="add to favorites"></img>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            : null
                    }
                    <div className="player-video-controls">
                        <div className="player-video-controls-row">
                            <button type="button" onClick={() => { advanceVideoTime(-50) }}>
                                Previous Frame
                            </button>
                            <button type="button" onClick={() => { advanceVideoTime(50) }}>
                                Next Frame
                            </button>
                        </div>
                        {/* {
                                props.video?.actors.map((actor, i) => {
                                    return (
                                        <div key={i} className="player-video-controls-row">
                                            <button type="button" onClick={() => { generateActorImage(actor) }}>
                                                {"Generate image for " + actor.name}
                                            </button>
                                        </div>)
                                })
                            } */}
                        <div className="player-video-controls-row">
                            <button type="button" onClick={() => { setThumbToCurrentTime() }}>
                                Set Thumbnail To Current Time
                            </button>
                        </div>
                        {
                            props.video !== null ?
                                <div className="player-video-controls-row">
                                    <button type="button" onClick={() => { toggleEditModal() }}>
                                        Edit Video
                                    </button>
                                    <Modal modalId={"bookinfo-edit-modal"} displayModal={showEditModal} toggleModal={toggleEditModal}>
                                        <EditPanel
                                            video={props.video}
                                            allActors={props.allActors}
                                            allSources={props.allSources}
                                            updateVideo={props.updateVideo}
                                            deleteVideo={props.deleteVideo}
                                            toggleDisplay={toggleEditModal}
                                            {...searchHandlers} />
                                    </Modal>
                                </div>
                                : null
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Player