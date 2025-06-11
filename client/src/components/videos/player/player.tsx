import React from "react";
import { Component } from "react";
import IVideo from "../../../interfaces/video";
import { IVideoSearchQuery } from "../../../interfaces/searchQuery";
import IActor from "../../../interfaces/actor";
import StarsIcon from "../../../img/stars.svg"
import CameraIcon from "../../../img/camera.svg"
import Modal from "../../shared/modal";
import EditPanel from "../editPanel/editPanel";
import IVideoSource from "../../../interfaces/videoSource";

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

interface PlayerState {
    showEditModal: boolean
}

class Player extends Component<PlayerProps, PlayerState> {
    private videoRef: React.RefObject<HTMLVideoElement>;

    constructor(props: PlayerProps) {
        super(props)

        this.state = {
            showEditModal: false
        }

        this.videoRef = React.createRef<HTMLVideoElement>()
    }

    videoUrl = () => {
        if (!this.props.video) return ""
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL
        return `${apiBaseUrl}/videos/${this.props.video.id}`
    }


    searchActor = (a: string): void => {
        this.props.viewSearchResults({
            actor: a
        })
    }

    searchSource = (g: string): void => {
        this.props.viewSearchResults({
            source: g
        })
    }

    searchTag = (t: string): void => {
        this.props.viewSearchResults({
            tag: t
        })
    }

    setThumbToCurrentTime = (): void => {
        if (this.props.video && this.videoRef.current) {
            let timeMs = Math.round(this.videoRef.current.currentTime * 1000)
            console.log('set thumbnail at ' + timeMs + 'ms')
            this.props.setThumbnailToTime(this.props.video.id, timeMs)
        }
    }

    advanceVideoTime = (ms: number): void => {
        if (this.videoRef.current) {
            let currentTime = this.videoRef.current.currentTime
            let newTime = currentTime + (ms * 0.001)
            if (newTime < 0) newTime = 0
            this.videoRef.current.currentTime = newTime
        }
    }

    toggleEditModal = (): void => {
        this.setState((state) => {
            return ({ showEditModal: !state.showEditModal })
        })
    }

    generateActorImage = (e: React.MouseEvent, actor: IActor): void => {
        if (actor && this.props.video && this.videoRef.current) {
            e.stopPropagation()
            let timeMs = Math.round(this.videoRef.current.currentTime * 1000)
            console.log('generate actor image at ' + timeMs + 'ms')
            this.props.generateImageForActor(this.props.video.id, actor.id, timeMs)
        }
    }

    render() {
        const searchHandlers = {
            searchActor: this.searchActor,
            searchSource: this.searchSource,
            searchTag: this.searchTag
        }
        return (
            <div className="player-container">
                <div className="player-inner">
                    <div className="player-video-container">
                        <div className="player-video">
                            <video muted preload="auto" ref={this.videoRef} controls={true} src={this.videoUrl()} style={{ width: '100%', height: '100%' }}></video>
                        </div>
                    </div>
                    <div className="player-video-info">
                        <h3 className="player-video-info-title">{this.props.video?.title}</h3>
                        <span className="player-video-info-id">{this.props.video?.id}</span>
                        {
                            this.props.video && this.props.video.actors.length > 0 ?
                                <div className="player-video-info-actors">
                                    {
                                        this.props.video.actors.map((actor, i) => {
                                            return (
                                                <div key={i} className="player-actor" onClick={() => this.searchActor(actor.name)}>
                                                    <div className="player-actor-image">
                                                        <img className="actorgallery-image" src={this.props.getActorImageUrl(actor)} alt={`${actor.name}`}></img>
                                                    </div>
                                                    <div className="caption">
                                                        <div className="player-actorimagegen-icon" onClick={(e) => this.generateActorImage(e, actor)}>
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
                                <button type="button" onClick={() => { this.advanceVideoTime(-50) }}>
                                    Previous Frame
                                </button>
                                <button type="button" onClick={() => { this.advanceVideoTime(50) }}>
                                    Next Frame
                                </button>
                            </div>
                            {/* {
                                this.props.video?.actors.map((actor, i) => {
                                    return (
                                        <div key={i} className="player-video-controls-row">
                                            <button type="button" onClick={() => { this.generateActorImage(actor) }}>
                                                {"Generate image for " + actor.name}
                                            </button>
                                        </div>)
                                })
                            } */}
                            <div className="player-video-controls-row">
                                <button type="button" onClick={() => { this.setThumbToCurrentTime() }}>
                                    Set Thumbnail To Current Time
                                </button>
                            </div>
                            {
                                this.props.video !== null ?
                                    <div className="player-video-controls-row">
                                        <button type="button" onClick={() => { this.toggleEditModal() }}>
                                            Edit Video
                                        </button>
                                        <Modal modalId={"bookinfo-edit-modal"} displayModal={this.state.showEditModal} toggleModal={this.toggleEditModal}>
                                            <EditPanel
                                                video={this.props.video}
                                                allActors={this.props.allActors}
                                                allSources={this.props.allSources}
                                                updateVideo={this.props.updateVideo}
                                                deleteVideo={this.props.deleteVideo}
                                                toggleDisplay={this.toggleEditModal}
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

}

export default Player