import type IActor from "../../../interfaces/actor"
import Modal from "../../shared/modal"
import EditPanel from "../editPanel/editPanel"
import CameraIcon from "../../../img/svg/camera.svg";
import StarsIcon from "../../../img/svg/stars.svg";
import type { PlayerProps } from "./player"

export interface PlayerSidebarProps extends PlayerProps {
    videoRef: React.RefObject<HTMLVideoElement | null>
    showEditModal: boolean,
    toggleEditModal(): void,
}

const PlayerSidebar = (props: PlayerSidebarProps) => {
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
        if (props.video && props.videoRef.current) {
            let timeMs = Math.round(props.videoRef.current.currentTime * 1000)
            console.log('set thumbnail at ' + timeMs + 'ms')
            props.setThumbnailToTime(props.video.id, timeMs)
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
        if (actor && props.video && props.videoRef.current) {
            e.stopPropagation()
            let timeMs = Math.round(props.videoRef.current.currentTime * 1000)
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
        <div className="player-video-info">
            <h3 className="player-video-info-title">{props.video?.title}</h3>
            <span className="player-video-info-id">{props.video?.id}</span>
            <div className="player-video-info-source">
                <span className="info-item clickable" onClick={() => searchSource(props.video!.source.name)}>{props.video?.source.name}</span>
            </div>
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
                <div className="player-video-controls-row">
                    <button type="button" onClick={() => { setThumbToCurrentTime() }}>
                        Set Thumbnail To Current Time
                    </button>
                </div>
                {
                    props.video !== null ?
                        <div className="player-video-controls-row">
                            <button type="button" onClick={() => { props.toggleEditModal() }}>
                                Edit Video
                            </button>
                            <Modal modalId={"bookinfo-edit-modal"} displayModal={props.showEditModal} toggleModal={props.toggleEditModal}>
                                <EditPanel
                                    video={props.video}
                                    allActors={props.allActors}
                                    allSources={props.allSources}
                                    updateVideo={props.updateVideo}
                                    deleteVideo={props.deleteVideo}
                                    toggleDisplay={props.toggleEditModal}
                                    {...searchHandlers} />
                            </Modal>
                        </div>
                        : null
                }
            </div>
        </div>
    )
}

export default PlayerSidebar