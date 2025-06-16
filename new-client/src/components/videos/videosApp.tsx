import { useEffect, useState } from "react";
import type { SubAppProps } from "../../App";
import type IActor from "../../interfaces/actor";
import type INavItem from "../../interfaces/navItem";
import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import type IVideo from "../../interfaces/video";
import type IVideoSource from "../../interfaces/videoSource";
import { VideosViewMode } from "../../util/enums";
import { getActorImageUrl, getVideoThumbnailUrl } from "../../util/helpers";
import Modal from "../shared/modal";
import Navigation from "../shared/navigation";
import MultiView from "./multiView";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

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

const getEmptyQuery = (): IVideoSearchQuery => {
  return {
    filled: false,
    actor: '',
    source: '',
    tag: '',
  }
}

const VideosApp = (props: VideosAppProps) => {
  const [allVideos, setAllVideos] = useState<IVideo[]>([])
  const [allActors, setAllActors] = useState<IActor[]>([])
  const [allSources, setAllSources] = useState<IVideoSource[]>([])
  const [viewMode, setViewMode] = useState<VideosViewMode>(VideosViewMode.Loading)
  const [currentVideo, setCurrentVideo] = useState<IVideo | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<IVideoSearchQuery>(getEmptyQuery())
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false)
  const [loadingModalText, setLoadingModalText] = useState<string>("")
  const [galleryPageSize, setGalleryPageSize] = useState<number>(16)

  useEffect(() => {
    const init = async () => {
      await fillData()
      setViewMode(VideosViewMode.Listing)
    }
    init();
  }, [])


  const videosFromJson = (videoJson: any): IVideo[] => {
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

  const actorsFromJson = (actorJson: any, videoJson: any): IActor[] => {
    let actorList: IActor[] = []
    if (!actorJson || actorJson.length < 1) console.log("actorsFromJson - no actors in input")
    actorJson.forEach((e: any): any => {
      let newActor = e as IActor
      newActor.isFavorite = e.isFavorite != null && e.isFavorite > 0
      newActor.videos = videoJson.filter((v: any) => v.actors.some((a: any) => a.id === newActor.id)).map((v: any) => v.id)
      actorList.push(newActor)
    });
    return actorList
  }

  const fillData = async () => {
    const res = await fetch(`${apiBaseUrl}/videos`)
    const data = await res.json()
    const videos = videosFromJson(data)
    setAllVideos(videos)
    await fillActors(videos)
    await fillSources()
  }

  const fillActors = async (videoJson: any) => {
    const res = await fetch(`${apiBaseUrl}/actors`)
    const data = await res.json()
    const actors = actorsFromJson(data, videoJson)
    setAllActors(actors)
  }

  const fillSources = async () => {
    const res = await fetch(`${apiBaseUrl}/videos/sources`)
    const data = await res.json()
    const sources = data.map((s: any) => s as IVideoSource)
    setAllSources(sources)
  }

  const updateVideo = async (video: IVideo) => {
    const res = await fetch(`${apiBaseUrl}/videos/${video.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Video " + video.id + " Updated")
      for (let i = 0; i < allVideos.length; i++) {
        if (allVideos[i] && allVideos[i].id === data.video.id) {
          const videos = allVideos
          videos[i] = data.video
          setAllVideos(videos)
        }
      }
    }
  }

  const updateActor = async (actor: IActor) => {
    const res = await fetch(`${apiBaseUrl}/actors/${actor.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actor)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Actor " + actor.id + " Updated")
      for (let i = 0; i < allActors.length; i++) {
        if (allActors[i] && allActors[i].id === data.actor.id) {
          let actors = allActors
          let newActor = data.actor as IActor
          newActor.isFavorite = data.actor.isFavorite != null && data.actor.isFavorite > 0
          newActor.videos = allVideos.filter((v: any) => v.actors.some((a: any) => a.id === newActor.id)).map((v: any) => v.id)
          actors[i] = newActor
          setAllActors(actors)
        }
      }
    }
  }

  const deleteVideo = async (videoId: number) => {
    console.log('delete video with id: ' + videoId)
    const res = await fetch(`${apiBaseUrl}/videos/${videoId}`, {
      method: 'delete'
    })
    const data = await res.json()
    if (data.changes > 0) {
      console.log('removed video ID: ' + videoId)
      setAllVideos(allVideos.filter((b) => b.id !== videoId))
      setCurrentVideo(null)
      setViewMode(VideosViewMode.Listing)
    }
  }

  const importVideos = async () => {
    console.log("Importing Videos")
    setViewMode(VideosViewMode.Loading)
    const res = await fetch(`${apiBaseUrl}/videos/import`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (data) {
      setAllVideos(videosFromJson(data.videos))
      setCurrentVideo(null)
      setViewMode(VideosViewMode.Listing)
    }
  }

  const setThumbnailToTime = async (videoId: number, timeMs: number) => {
    console.log('set thumbnail for video:' + videoId + ' to ' + timeMs + 'ms')
    toggleLoadingModal("Generating thumbnail for video " + videoId)
    const res = await fetch(`${apiBaseUrl}/videos/thumbnail/${videoId}/generate/${timeMs}`, {
      method: 'post'
    })
    const data = await res.json()
    if (data.success) {
      console.log('successfully updated thumbnail for: ' + videoId + " new thumb: " + data.video.thumbnailId)
      for (let i = 0; i < allVideos.length; i++) {
        if (allVideos[i] && allVideos[i].id === data.video.id) {
          let videos = allVideos
          videos[i].thumbnailId = data.video.thumbnailId
          setAllVideos(videos)
          setShowLoadingModal(false)
        }
      }
    }
  }

  const generateImageForActor = async (videoId: number, actorId: number, timeMs: number) => {
    console.log('Generating image for actor: ' + actorId + " from video " + videoId + " @" + timeMs + 'ms')
    toggleLoadingModal("Generating image for actor " + actorId)
    const res = await fetch(`${apiBaseUrl}/actors/${actorId}/imagefromvideo`, {
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
    const data = await res.json()
    if (data.success) {
      console.log('successfully generated  image for: ' + actorId + " new image: " + data.actor.imageFile)
      for (let i = 0; i < allActors.length; i++) {
        if (allActors[i] && allActors[i].id === data.actor.id) {
          let actors = allActors
          actors[i].imageFile = data.actor.imageFile
          setAllActors(actors)
          setShowLoadingModal(false)
        }
      }
    }
  }

  const watchVideo = (video: IVideo) => {
    setCurrentVideo(video)
    setViewMode(VideosViewMode.Player)
  }

  const viewCurrentVideo = () => {
    if (currentVideo && currentVideo.title) {
      setViewMode(VideosViewMode.Player)
    }
  }



  const viewSearchResults = (query?: IVideoSearchQuery) => {
    if (query) {
      let newQuery = { ...getEmptyQuery(), ...query }
      newQuery.filled = true
      setCurrentSearchQuery(newQuery)
      setViewMode(VideosViewMode.SearchResults)
    } else if (currentSearchQuery.filled) {
      setViewMode(VideosViewMode.SearchResults)
    }
  }

  const viewListing = () => {
    setViewMode(VideosViewMode.Listing)
  }

  const viewActors = () => {
    setViewMode(VideosViewMode.Actors)
  }

  const viewSources = () => {
    setViewMode(VideosViewMode.Sources)
  }

  const getActorImageUrlWithFallback = (actor: IActor): string => {
    let matchingActor = allActors.find((a) => a.id === actor.id)
    if (!matchingActor) return ""
    if (matchingActor.imageFile) return getActorImageUrl(actor)
    let matchingVideos = allVideos.filter((v) => v.actors.some((a) => a.id === actor.id) && v.thumbnailId)
    if (matchingVideos.length > 0) return getVideoThumbnailUrl(matchingVideos[0])
    return ""
  }

  const getLeftNavItems = (): INavItem[] => {
    return [
      {
        text: "Videos",
        viewMode: VideosViewMode.Listing,
        clickHandler: viewListing
      },
      {
        text: "Actors",
        viewMode: VideosViewMode.Actors,
        clickHandler: viewActors
      },
      {
        text: "Sources",
        viewMode: VideosViewMode.Sources,
        clickHandler: viewSources
      },
      {
        text: "Current Video",
        viewMode: VideosViewMode.Player,
        clickHandler: viewCurrentVideo
      },
      {
        text: "Search Results",
        viewMode: VideosViewMode.SearchResults,
        clickHandler: viewSearchResults
      }
    ]
  }

  const getRightNavItems = (): INavItem[] => {
    return [
      {
        text: "Import Videos",
        clickHandler: importVideos
      },
      {
        text: "Books",
        clickHandler: props.viewBooksApp
      }]
  }

  const toggleLoadingModal = (text?: string) => {
    setLoadingModalText(text ?? "")
    setShowLoadingModal(!showLoadingModal)
  }

  const navProps = {
    viewMode: viewMode,
    leftNavItems: getLeftNavItems(),
    rightNavItems: getRightNavItems(),
    showSearch: true,
    logoClick: viewListing,
    viewSearchResults: viewSearchResults
  }

  const handlers = {
    watchVideo: watchVideo,
    viewListing: viewListing,
    viewActors: viewActors,
    viewCurrentVideo: viewCurrentVideo,
    viewSearchResults: viewSearchResults,
    updateVideo: updateVideo,
    deleteVideo: deleteVideo,
    importVideos: importVideos,
    setThumbnailToTime: setThumbnailToTime,
    updateActor: updateActor,
    getActorImageUrl: getActorImageUrlWithFallback,
    generateImageForActor: generateImageForActor
  }

  const appState: VideosAppState = {
    galleryPageSize: galleryPageSize,
    allVideos: allVideos,
    allActors: allActors,
    allSources: allSources,
    viewMode: viewMode,
    currentVideo: currentVideo,
    currentSearchQuery: currentSearchQuery,
    showLoadingModal: showLoadingModal,
    loadingModalText: loadingModalText
  }

  return (
    <div className="VideosApp">
      <Modal
        modalId="loading-modal"
        displayModal={showLoadingModal}
        toggleModal={toggleLoadingModal}>
        <span className="loading-modal-text">{loadingModalText}</span>
      </Modal>
      <Navigation {...navProps}>
      </Navigation>
      <MultiView {...appState} {...handlers}></MultiView>
    </div>
  )
}

export default VideosApp;
