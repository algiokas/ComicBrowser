import { useEffect, useState } from "react";
import type { SubAppProps } from "../../App";
import type IActor from "../../interfaces/actor";
import type INavItem from "../../interfaces/navItem";
import type { IVideoSearchQuery } from "../../interfaces/searchQuery";
import type IVideo from "../../interfaces/video";
import type IVideoSource from "../../interfaces/videoSource";
import { VideosViewMode } from "../../util/enums";
import { actorFromJson, actorsFromJson, getActorImageUrlWithFallback, videosFromJson } from "../../util/videoUtils";
import Modal from "../shared/modal";
import Navigation from "../shared/navigation";
import type { FileWithData } from "./gallery/sourceDetail";
import MultiView from "./multiView";
import { VideosAppContext, type VideosAppState } from "./videosAppContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

interface VideosAppProps extends SubAppProps { }

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

  //#region Initialization
  useEffect(() => {
    const init = async () => {
      await fillData()
      setViewMode(VideosViewMode.Listing)
    }
    init();
  }, [])

  const fillData = async () => {
    const res = await fetch(`${apiBaseUrl}/videos`)
    const data = await res.json()
    const videos = videosFromJson(data)
    setAllVideos(videos)
    await fillActors(videos)
    await fillSources()
  }

  const fillActors = async (videos: IVideo[]) => {
    const res = await fetch(`${apiBaseUrl}/actors`)
    const data = await res.json()
    const actors = await actorsFromJson(data, videos)
    setAllActors(actors)
    updateVideoActors(videos, actors)
  }
  
  const updateVideoActors = (videos: IVideo[], actors: IActor[]): void => {
    const newVideosList = videos
    newVideosList.forEach((v: IVideo) => {
      if (v.actors.length > 0) {
        v.actors = v.actors.map((a: IActor) => actors.find(x => x.id === a.id)).filter(a => a !== undefined)
      }
    })
    setAllVideos(newVideosList)
  }

  const fillSources = async () => {
    const res = await fetch(`${apiBaseUrl}/videos/sources`)
    const data = await res.json()
    const sources = data.map((s: any) => s as IVideoSource)
    setAllSources(sources)
  }
  //#endregion

  //#region API
  const updateVideo = async (video: IVideo) => {
    const res = await fetch(`${apiBaseUrl}/videos/${video.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Video " + video.id + " Updated")
      const newVideos = allVideos.map(v => { return v.id === data.video.id ? data.video as IVideo : v })
      setAllVideos(newVideos)
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
          let newActor = await actorFromJson(data.actor, allVideos)
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
          actors[i].imageUrl = await getActorImageUrlWithFallback(actors[i], allVideos)
          setAllActors(actors)
          setShowLoadingModal(false)
        }
      }
    }
  }

  const uploadSourceImage = async (sourceId: number, imageSize: 'small' | 'large', fileData: FileWithData) => {
    toggleLoadingModal(`Uploading image for source: ${sourceId}`)
    const res = await fetch(`${apiBaseUrl}/videos/upload/sourceimage/${sourceId}/${imageSize}`, {
      method: 'post',
      headers: {
        "Content-Type": fileData.file.type
      },
      body: fileData.data
    })
    const data = await res.json()
    if (data.success) {
      for (let i = 0; i < allSources.length; i++) {
        if (allSources[i] && allSources[i].id === data.source.id) {
          let sources = allSources
          sources[i] = data.source as IVideoSource
          setAllSources(sources)
          setShowLoadingModal(false)
        }
      }
    }
  }

  //#region View Mode
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

  const toggleLoadingModal = (text?: string) => {
    setLoadingModalText(text ?? "")
    setShowLoadingModal(!showLoadingModal)
  }
  //#endregion

  //#region Nav Items
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
  //#endregion

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
    generateImageForActor: generateImageForActor,
    uploadSourceImage: uploadSourceImage
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
    loadingModalText: loadingModalText,
  }

  return (
    <VideosAppContext value={appState}>
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
    </VideosAppContext>
  )
}

export default VideosApp;
