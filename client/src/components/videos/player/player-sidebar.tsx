import type IActor from "../../../interfaces/actor"
import Modal from "../../shared/modal"
import VideoEditPanel from "../editPanel/videoEditPanel"
import CameraIcon from "../../../img/svg/camera.svg";
import StarsIcon from "../../../img/svg/stars.svg";
import type { PlayerProps } from "./player"
import { useContext } from "react";
import { VideosAppContext } from "../videosAppContext";
import type IVideo from "../../../interfaces/video";

export interface PlayerSidebarProps extends PlayerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    showEditModal: boolean,
    toggleEditModal(): void,
}

const PlayerSidebar = (props: PlayerSidebarProps) => {
    const appContext = useContext(VideosAppContext)

    const searchActor = (a: string): void => {
        appContext.viewSearchResults({
            actor: a
        })
    }

    const searchSource = (g: string): void => {
        appContext.viewSearchResults({
            source: g
        })
    }

    const searchTag = (t: string): void => {
        appContext.viewSearchResults({
            tag: t
        })
    }

    const setThumbToCurrentTime = (): void => {
        if (appContext.currentVideo && props.videoRef.current) {
            let timeMs = Math.round(props.videoRef.current.currentTime * 1000)
            console.log('set thumbnail at ' + timeMs + 'ms')
            appContext.setThumbnailToTime(appContext.currentVideo.id, timeMs)
        }
    }

    const advanceVideoTime = (ms: number): void => {
        if (props.videoRef.current) {
            let currentTime = props.videoRef.current.currentTime
            let newTime = currentTime + (ms * 0.001)
            if (newTime < 0) newTime = 0
            props.videoRef.current.currentTime = newTime
        }
    }

    const generateActorImage = (e: React.MouseEvent, actor: IActor): void => {
        if (actor && appContext.currentVideo && props.videoRef.current) {
            e.stopPropagation()
            let timeMs = Math.round(props.videoRef.current.currentTime * 1000)
            console.log('generate actor image at ' + timeMs + 'ms')
            appContext.generateImageForActor(appContext.currentVideo.id, actor.id, timeMs)
        }
    }

    const videoFavoriteClick = (e: React.MouseEvent) => {
        if (appContext.currentVideo) {
            e.stopPropagation()
            const tempVideo: IVideo = { ...appContext.currentVideo, isFavorite: !appContext.currentVideo.isFavorite }
            appContext.updateVideo(tempVideo)
        }
    }

    const actorFavoriteClick = (e: React.MouseEvent, a: IActor) => {
        e.stopPropagation()
        a.isFavorite = !a.isFavorite; //toggle value
        appContext.updateActor(a)
    }

    const searchHandlers = {
        searchActor: searchActor,
        searchSource: searchSource,
        searchTag: searchTag
    }

    return (
        <div className="player-video-sidebar">
            {
                appContext.currentVideo ?
                    <div className="player-video-info">
                        <h3 className="player-video-info-title">{appContext.currentVideo?.title}</h3>
                        <div className="player-video-favorite" onClick={(e) => videoFavoriteClick(e)}>
                            {
                                appContext.currentVideo.isFavorite ?
                                    <img className="svg-icon-favorite" src={StarsIcon.toString()} alt="remove from favorites"></img>
                                    :
                                    <img className="svg-icon-disabled test" src={StarsIcon.toString()} alt="add to favorites"></img>
                            }
                        </div>
                        <span className="player-video-info-id">{appContext.currentVideo?.id}</span>
                        <div className="player-video-info-source">
                            <span className="info-item clickable" onClick={() => searchSource(appContext.currentVideo!.source.name)}>{appContext.currentVideo?.source.name}</span>
                        </div>
                        {
                            appContext.currentVideo.actors.length > 0 ?
                                <div className="player-video-info-actors">
                                    {
                                        appContext.currentVideo.actors.map((actor, i) => {
                                            return (
                                                <div key={i} className="player-actor" onClick={() => searchActor(actor.name)}>
                                                    <div className="player-actor-image">
                                                        <img className="actorgallery-image" src={actor.imageUrl} alt={`${actor.name}`}></img>
                                                    </div>
                                                    <div className={`caption ${(actor.isFavorite ? 'favorite' : '')}`}>
                                                        <div className="player-actorimagegen-icon" onClick={(e) => generateActorImage(e, actor)}>
                                                            <img className="svg-icon-favorite" src={CameraIcon.toString()} alt={"Generate image for " + actor.name}></img>
                                                        </div>
                                                        <span>{actor.name}</span>
                                                        <div className="player-actor-favorite" onClick={(e) => actorFavoriteClick(e, actor)}>
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
                        
                        <div className="player-video-info-tags">
                            <h4 className="tags-header">Tags:</h4>
                            <div className="tags-list">
                            {
                                appContext.currentVideo.tags.map((tag, i) => {
                                    return (
                                        <div key={i} className="player-tag info-item clickable" onClick={() => searchTag(tag.name)}>
                                            {tag.name}
                                        </div>
                                    )
                                })
                            }
                            </div>

                        </div>
                        <div className="player-video-controls">
                            <div className="player-video-controls-row">
                                <button type="button" onClick={() => { advanceVideoTime(-50) }}>
                                    Previous Frame
                                </button>
                                <button type="button" onClick={() => { advanceVideoTime(50) }}>
                                    Next Frame
                                </button>
                            </div>
                            <div className="player-video-controls-row">
                                <button type="button" onClick={() => { setThumbToCurrentTime() }}>
                                    Set Thumbnail To Current Time
                                </button>
                            </div>
                            <div className="player-video-controls-row">
                                <button type="button" onClick={() => { props.toggleEditModal() }}>
                                    Edit Video
                                </button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                appContext.currentVideo ?
                    <Modal modalId={"bookinfo-edit-modal"} displayModal={props.showEditModal} toggleModal={props.toggleEditModal}>
                        <VideoEditPanel
                            video={appContext.currentVideo}
                            toggleDisplay={props.toggleEditModal}
                            {...searchHandlers} />
                    </Modal> : null
            }
        </div>
    )
}

export default PlayerSidebar