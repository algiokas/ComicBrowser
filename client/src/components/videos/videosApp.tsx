import { useEffect, useState } from "react";
import type { SubAppProps } from "../../App";
import type { Actor } from "../../types/actor";
import type { NavItem } from "../../types/navItem";
import type { IVideoSearchQuery } from "../../types/searchQuery";
import type { ActorTag, VideoTag } from "../../types/tags";
import type { Video } from "../../types/video";
import type { VideoSource } from "../../types/videoSource";
import { TagType, VideosViewMode } from "../../util/enums";
import { actorFromJson, actorsFromJson, getActorImageUrlWithFallback, getEmptyQuery, videoFromJson, videosFromJson } from "../../util/videoUtils";
import Modal from "../shared/modal";
import Navigation from "../shared/navigation";
import type { FileWithData } from "./gallery/sourceDetail";
import MultiView from "./multiView";
import { type VideosAppHandlers, type VideosAppState, VideosAppContext } from "./videosAppContext";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

interface VideosAppProps extends SubAppProps { }

const VideosApp = (props: VideosAppProps) => {
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [allActors, setAllActors] = useState<Actor[]>([])
  const [allSources, setAllSources] = useState<VideoSource[]>([])
  const [allVideoTags, setAllVideoTags] = useState<VideoTag[]>([])
  const [allActorTags, setAllActorTags] = useState<ActorTag[]>([])

  const [viewMode, setViewMode] = useState<VideosViewMode>(VideosViewMode.Loading)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<IVideoSearchQuery>(getEmptyQuery())
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false)
  const [loadingModalText, setLoadingModalText] = useState<string>("")
  const [galleryPageSize, setGalleryPageSize] = useState<number>(16)

  const [videoListingPage, setVideoListingPage] = useState<number>(0)
  const [actorListingPage, setActorListingPage] = useState<number>(0)

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

    await fillVideoTags()
    await fillActorTags()
    
    await fillActors(videos)
    await fillSources()
  }

  const fillVideoTags = async () => {
    const videoTagsRes = await fetch(`${apiBaseUrl}/videos/tags`)
    const videoTagsData = await videoTagsRes.json()
    const videoTags = videoTagsData.map((t: Omit<VideoTag, 'tagType'>) => { return {...t, tagType: 'video'} as VideoTag})
    setAllVideoTags(videoTags as VideoTag[])
  }

  const fillActorTags = async () => {
    const actorTagsRes = await fetch(`${apiBaseUrl}/actors/tags`)
    const actorTagsData = await actorTagsRes.json()
    const actorTags = actorTagsData.map((t: Omit<ActorTag, 'tagType'>) => { return {...t, tagType: 'actor'} as ActorTag})
    setAllActorTags(actorTags as ActorTag[])
  }

  const fillActors = async (videos: Video[]) => {
    const res = await fetch(`${apiBaseUrl}/actors`)
    const data = await res.json()
    const actors = await actorsFromJson(data, videos)
    setAllActors(actors)
    updateAllVideoActors(videos, actors)
  }

  const updateAllVideoActors = (videos: Video[], actors: Actor[]): void => {
    const newVideosList = videos
    newVideosList.forEach((v: Video) => { updateVideoActors(v, actors) })
    setAllVideos(newVideosList)
  }

  const updateVideoActors = (v: Video, actors: Actor[]) => {
    if (v.actors.length > 0) {
      v.actors = v.actors.map((a: Actor) => actors.find(x => x.id === a.id)).filter(a => a !== undefined)
    }
  }

  const fillSources = async () => {
    const res = await fetch(`${apiBaseUrl}/videos/sources`)
    const data = await res.json()
    const sources = data.map((s: any) => s as VideoSource)
    setAllSources(sources)
  }
  //#endregion

  //#region API
  const updateVideo = async (video: Video) => {
    const res = await fetch(`${apiBaseUrl}/videos/${video.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Video " + video.id + " Updated")
      const vData = videoFromJson(data.video)
      updateVideoActors(vData, allActors)
      const newVideos = allVideos.map(v => { return v.id === data.video.id ? vData : v })
      setAllVideos(newVideos)
      if (currentVideo?.id === data.video.id) {
        setCurrentVideo(vData)
      }
      await fillVideoTags()
    }
  }

  const updateActor = async (actor: Actor) => {
    const res = await fetch(`${apiBaseUrl}/actors/${actor.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actor)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Actor " + actor.id + " Updated")
      const newActors: Actor[] = []
      for (const a of allActors) {
        if (a.id === data.actor.id) {
          const newActor = await actorFromJson(data.actor, allVideos)
          newActors.push(newActor)
        } else {
          newActors.push(a)
        }
      }
      setAllActors(newActors)
      await fillActorTags()
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
    setLoadingModal(true, "Generating thumbnail for video " + videoId)
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
    setLoadingModal(true, "Generating image for actor " + actorId)
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
    setLoadingModal(true, `Uploading image for source: ${sourceId}`)
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
          sources[i] = data.source as VideoSource
          setAllSources(sources)
          setShowLoadingModal(false)
        }
      }
    }
  }

  //#region View Mode
  const watchVideo = (video: Video) => {
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

  const viewListing = () => { setViewMode(VideosViewMode.Listing) }

  const viewActors = () => { setViewMode(VideosViewMode.Actors) }

  const viewSources = () => { setViewMode(VideosViewMode.Sources) }

  const viewTags = () => { setViewMode(VideosViewMode.Tags) }

  const setLoadingModal = (show: boolean, text?: string) => {
    setLoadingModalText(text ?? "")
    setShowLoadingModal(show)
  }
  //#endregion

  //#region Nav Items
  const leftNavItems: NavItem[] = [
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
      text: "Tags",
      viewMode: VideosViewMode.Tags,
      clickHandler: viewTags
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

  const rightNavItems: NavItem[] = [
    {
      text: "Import Videos",
      clickHandler: importVideos
    },
    {
      text: "Books",
      clickHandler: props.viewBooksApp
    }
  ]
  //#endregion

  const navProps = {
    viewMode: viewMode,
    leftNavItems: leftNavItems,
    rightNavItems: rightNavItems,
    showSearch: true,
    logoClick: viewListing,
    viewSearchResults: viewSearchResults
  }

  const handlers: VideosAppHandlers = {
    watchVideo: watchVideo,
    viewListing: viewListing,
    viewActors: viewActors,
    viewCurrentVideo: viewCurrentVideo,
    viewSearchResults: viewSearchResults,
    setVideoListingPage: (n: number) => { setVideoListingPage(n) },
    setActorListingPage: (n: number) => { setActorListingPage(n) },
    setLoadingModal: setLoadingModal,

    updateVideo: updateVideo,
    deleteVideo: deleteVideo,
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
    allVideoTags: allVideoTags,
    allActorTags: allActorTags,
    viewMode: viewMode,
    currentVideo: currentVideo,
    currentSearchQuery: currentSearchQuery,
    showLoadingModal: showLoadingModal,
    loadingModalText: loadingModalText,
    videoListingPage: videoListingPage,
    actorListingPage: actorListingPage
  }

  return (
    <VideosAppContext value={{ ...appState, ...handlers }}>
      <div className="VideosApp">
        <Modal
          modalId="loading-modal"
          displayModal={showLoadingModal}
          toggleModal={() => setLoadingModal(!showLoadingModal)}>
            <div className="loading-modal-inner">
              <span className="loader"></span>
              <span className="loading-modal-text">{loadingModalText}</span>
            </div>
        </Modal>
        <Navigation {...navProps}>
        </Navigation>
        <MultiView
          viewMode={viewMode}
          galleryPageSize={galleryPageSize}
          currentSearchQuery={currentSearchQuery} />
      </div>
    </VideosAppContext>
  )
}

export default VideosApp;
