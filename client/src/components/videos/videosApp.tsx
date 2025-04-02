import React, { Component } from "react";
import Navigation from "../shared/navigation";
import MultiView from "./multiView";
import { VideosViewMode } from "../../util/enums";
import IVideo from "../../interfaces/video";
import { IVideoSearchQuery } from "../../interfaces/searchQuery";
import { SubAppProps } from "../../App";
import IActor from "../../interfaces/actor";
import { getActorImageUrl, getVideoThumbnailUrl } from "../../util/helpers";
import INavItem from "../../interfaces/navItem";
import Modal from "../shared/modal";
import IVideoSource from "../../interfaces/videoSource";

const apiBaseUrl = process.env.REACT_APP_VIDEOS_API_BASE_URL

interface VideosAppProps extends SubAppProps {

}

export interface VideosAppState {
  galleryPageSize: number,
  allVideos: IVideo[],
  allActors: IActor[],
  allSources: IVideoSource[],
  viewMode: VideosViewMode,
  currentVideo: IVideo | null,
  currentSearchQuery: IVideoSearchQuery,
  showLoadingModal: boolean,
  loadingModalText: string
}

class VideosApp extends Component<VideosAppProps, VideosAppState> {
  constructor(props: VideosAppProps) {
    super(props);

    this.state = {
      galleryPageSize: 16,
      allVideos: [],
      allActors: [],
      allSources: [],
      viewMode: VideosViewMode.Loading,
      currentVideo: null,
      currentSearchQuery: this.getEmptyQuery(),
      showLoadingModal: false,
      loadingModalText: ""
    }
  }

  componentDidMount() {
    this.fillData();
    this.setState({
      viewMode: VideosViewMode.Listing
    })
  }

  videosFromJson(videoJson: any): IVideo[] {
    let videoList: IVideo[] = []
    if (!videoJson || videoJson.length < 1) console.log("videosFromJson - no videos in input")
    videoJson.forEach((e: any): any => {
      let newVideo = e as IVideo
      if (e.addedDate) {
        newVideo.addedDate = new Date(e.addedDate)
      }
      videoList.push(newVideo)
    });
    return videoList
  }

  actorsFromJson(actorJson: any, videoJson: any): IActor[] {
    let actorList: IActor[] = []
    if (!actorJson || actorJson.length < 1) console.log("actorsFromJson - no actors in input")
    actorJson.forEach((e: any): any => {
      let newActor = e as IActor
      newActor.isFavorite = e.isFavorite != null && e.isFavorite > 0
      newActor.videos = videoJson.filter((v : any) => v.actors.some((a : any) => a.id === newActor.id)).map((v : any) => v.id)
      actorList.push(newActor)
    });
    return actorList
  }

  fillData = () => {
    fetch(apiBaseUrl + "videos")
      .then(res => res.json())
      .then(data => {
        console.log('fetch videos')
        var videoJson = this.videosFromJson(data)
        this.setState({ allVideos: videoJson })
        this.fillActors(videoJson)
      });
  }

  fillActors = (videoJson: any) => {
    fetch(apiBaseUrl + "actors")
      .then(res => res.json())
      .then(data => {
        console.log('fetch actors')
        var actorJson = this.actorsFromJson(data, videoJson)
        this.setState({ allActors: actorJson })
      });
  }

  fillSources = () => {
    fetch(apiBaseUrl + "/videos/sources")
      .then(res => res.json())
      .then(data => {
        console.log('fetch sources')
        let sources = data.map((s: any) => s as IVideoSource)
        this.setState({ allSources: sources })
      });
  }

  updateVideo = (video: IVideo) => {
    fetch(apiBaseUrl + 'videos/' + video.id + "/update", {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Video " + video.id + " Updated")
          for (let i = 0; i < this.state.allVideos.length; i++) {
            if (this.state.allVideos[i] && this.state.allVideos[i].id === data.video.id) {
              this.setState((state) => {
                let videos = state.allVideos
                videos[i] = data.video
                return { allVideos: videos }
              })
            }
          }
        }
      });
  }

  updateActor = (actor: IActor) => {
    fetch(apiBaseUrl + 'actors/' + actor.id + '/update', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actor)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Actor " + actor.id + " Updated")
          for (let i = 0; i < this.state.allActors.length; i++) {
            if (this.state.allActors[i] && this.state.allActors[i].id === data.actor.id) {
              this.setState((state) => {
                let actors = state.allActors
                let newActor = data.actor as IActor
                newActor.isFavorite = data.actor.isFavorite != null && data.actor.isFavorite > 0
                newActor.videos = this.state.allVideos.filter((v : any) => v.actors.some((a : any) => a.id === newActor.id)).map((v : any) => v.id)
                actors[i] = newActor
                return { allActors: actors }
              })
            }
          }
        }
      });
  }

  deleteVideo = (videoId: number) => {
    console.log('delete video with id: ' + videoId)
    fetch(apiBaseUrl + 'videos/' + videoId, {
      method: 'delete'
    })
      .then(res => res.json())
      .then(data => {
        if (data.changes > 0) {
          console.log('removed video ID: ' + videoId)
          this.setState((state: VideosAppState): object | null => {
            return ({
              allVideos: state.allVideos.filter((b) => b.id !== videoId),
              currentVideo: {},
              viewMode: VideosViewMode.Listing
            })
          })
        }
      });
  }

  importVideos = () => {
    console.log("Importing Videos")
    this.setState({ viewMode: VideosViewMode.Loading })
    fetch(apiBaseUrl + 'videos/import', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          this.setState({
            allVideos: this.videosFromJson(data.videos),
            currentVideo: null,
            viewMode: VideosViewMode.Listing
          })
        }
      });
  }

  setThumbnailToTime = (videoId: number, timeMs: number) => {
    console.log('set thumbnail for video:' + videoId + ' to ' + timeMs + 'ms')
    this.toggleLoadingModal("Generating thumbnail for video " + videoId)
    fetch(apiBaseUrl + '/videos/thumbnail/' + videoId + '/generate/' + timeMs, {
      method: 'post'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('successfully updated thumbnail for: ' + videoId + " new thumb: " + data.video.thumbnailId)
          for (let i = 0; i < this.state.allVideos.length; i++) {
            if (this.state.allVideos[i] && this.state.allVideos[i].id === data.video.id) {
              this.setState((state) => {
                let videos = state.allVideos
                videos[i].thumbnailId = data.video.thumbnailId
                return { 
                  allVideos: videos,
                  showLoadingModal: false
                }
              })
            }
          }
        }
      });
  }

  generateImageForActor = (videoId: number, actorId: number, timeMs: number) => {
    console.log('Generating image for actor: ' + actorId + " from video " + videoId + " @" + timeMs + 'ms')
    this.toggleLoadingModal("Generating image for actor " + actorId)
    fetch(apiBaseUrl + 'actors/' + actorId + '/imagefromvideo', {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        videoId: videoId,
        timeMs: timeMs
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('successfully generated  image for: ' + actorId + " new image: " + data.actor.imageFile)
          for (let i = 0; i < this.state.allActors.length; i++) {
            if (this.state.allActors[i] && this.state.allActors[i].id === data.actor.id) {
              this.setState((state) => {
                let actors = state.allActors
                actors[i].imageFile = data.actor.imageFile
                return { 
                  allActors: actors,
                  showLoadingModal: false
                }
              })
            }
          }
        }
      });
  }

  watchVideo = (video: IVideo) => {
    this.setState({
      viewMode: VideosViewMode.Player,
      currentVideo: video
    })
  }

  viewCurrentVideo = () => {
    if (this.state.currentVideo && this.state.currentVideo.title) {
      this.setState({
        viewMode: VideosViewMode.Player
      })
    }
  }

  getEmptyQuery(): IVideoSearchQuery {
    return {
      filled: false,
      actor: '',
      source: '',
      tag: '',
    }
  }

  viewSearchResults = (query?: IVideoSearchQuery) => {
    if (query) {
      let newQuery = { ...this.getEmptyQuery(), ...query }
      newQuery.filled = true
      this.setState({
        currentSearchQuery: newQuery,
        viewMode: VideosViewMode.SearchResults
      })
    } else if (this.state.currentSearchQuery.filled) {
      this.setState({
        viewMode: VideosViewMode.SearchResults
      })
    }
  }

  viewListing = () => {
    this.setState({
      viewMode: VideosViewMode.Listing
    })
  }

  viewActors = () => {
    this.setState({
      viewMode: VideosViewMode.Actors
    })
  }

  getActorImageUrlWithFallback = (actor: IActor): string => {
    let matchingActor = this.state.allActors.find((a) => a.id === actor.id)
    if (!matchingActor) return ""
    if (matchingActor.imageFile) return getActorImageUrl(actor)
    let matchingVideos = this.state.allVideos.filter((v) => v.actors.some((a) => a.id === actor.id) && v.thumbnailId)
    if (matchingVideos.length > 0) return getVideoThumbnailUrl(matchingVideos[0])
    return ""
  }

  getLeftNavItems(): INavItem[] {
    return [
      {
        text: "Videos",
        viewMode: VideosViewMode.Listing,
        clickHandler: this.viewListing
      },
      {
        text: "Actors",
        viewMode: VideosViewMode.Actors,
        clickHandler: this.viewActors
      },
      {
        text: "Current Video",
        viewMode: VideosViewMode.Player,
        clickHandler: this.viewCurrentVideo
      },
      {
        text: "Search Results",
        viewMode: VideosViewMode.SearchResults,
        clickHandler: this.viewSearchResults
      }
    ]
  }

  getRightNavItems(): INavItem[] {
    return [
      {
        text: "Import Videos",
        clickHandler: this.importVideos
      },
      {
        text: "Books",
        clickHandler: this.props.toggleAppMode
      }]
  }

  toggleLoadingModal = (text?: string) => {
    this.setState((state) => {
      return {
        showLoadingModal: !state.showLoadingModal,
        loadingModalText: text ?? ""
      }
    })
  }

  render() {
    const navProps = {
      viewMode: this.state.viewMode,
      leftNavItems: this.getLeftNavItems(),
      rightNavItems: this.getRightNavItems(),
      logoClick: this.viewListing,
    }

    const handlers = {
      watchVideo: this.watchVideo,
      viewListing: this.viewListing,
      viewActors: this.viewActors,
      viewCurrentVideo: this.viewCurrentVideo,
      viewSearchResults: this.viewSearchResults,
      updateVideo: this.updateVideo,
      deleteVideo: this.deleteVideo,
      importVideos: this.importVideos,
      setThumbnailToTime: this.setThumbnailToTime,
      updateActor: this.updateActor,
      getActorImageUrl: this.getActorImageUrlWithFallback,
      generateImageForActor: this.generateImageForActor
    }

    return (
      <div className="VideosApp">
        <Modal 
          modalId="loading-modal"
          displayModal={this.state.showLoadingModal}
          toggleModal={this.toggleLoadingModal}>
          <span className="loading-modal-text">{this.state.loadingModalText}</span>
        </Modal>
        <Navigation {...navProps}>
        </Navigation>
        <MultiView {...this.state} {...handlers}></MultiView>
      </div>
    )
  }
}

export default VideosApp;
