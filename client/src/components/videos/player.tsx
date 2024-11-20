import React from "react";
import { Component } from "react";
import IVideo from "../../interfaces/video";
import { IVideoSearchQuery } from "../../interfaces/searchQuery";
import IActor from "../../interfaces/actor";
import StarsIcon from "../../img/stars.svg"
import CameraIcon from "../../img/camera.svg"

interface PlayerProps {
    video: IVideo | null
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
}

class Player extends Component<PlayerProps, PlayerState> {
    private videoRef: React.RefObject<HTMLVideoElement>;

    constructor(props: PlayerProps) {
        super(props)

        this.videoRef = React.createRef<HTMLVideoElement>()
    }

    videoUrl = () => {
        if (!this.props.video) return ""
        return process.env.REACT_APP_VIDEOS_API_BASE_URL + "videos/" + this.props.video.id
    }

    searchGroup = (g: string): void => {
        this.props.viewSearchResults({
            source: g
        })
    }

    searchActor = (a: string): void => {
        this.props.viewSearchResults({
            actor: a
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

    deleteVideo = (): void => {
        if (this.props.video) {
            this.props.deleteVideo(this.props.video.id)
        }
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
                            <div className="player-video-controls-row">
                                <button type="button" onClick={() => { this.deleteVideo() }}>
                                    Delete Video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }

}

export default Player