import { useEffect, useState } from "react";
import type { SubAppProps } from "../../App";
import type { Actor } from "../../types/actor";
import type { NavItem } from "../../types/navItem";
import type { IVideoSearchQuery } from "../../types/searchQuery";
import { type VideosAppTag, type ActorTag, type VideoTag } from "../../types/tags";
import type { Video } from "../../types/video";
import type { VideoSource } from "../../types/videoSource";
import { TagType, VideosSortOrder, VideosViewMode } from "../../util/enums";
import { getEmptyQuery } from "../../util/videoUtils";
import { getActorImageUrlWithFallback } from "../../mappers/videoMappers";
import * as videosApi from "../../api/videosApi";
import Modal from "../shared/modal";
import Navigation from "../shared/navigation";
import type { FileWithData } from "../../types/fileWithData";
import MultiView from "./multiView";
import { type VideosAppHandlers, type VideosAppState, VideosAppContext } from "../../context/videosAppContext";

interface VideosAppProps extends SubAppProps { }

const VideosApp = (props: VideosAppProps) => {
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [allActors, setAllActors] = useState<Actor[]>([])
  const [allSources, setAllSources] = useState<VideoSource[]>([])
  const [allVideoTags, setAllVideoTags] = useState<VideoTag[]>([])
  const [allActorTags, setAllActorTags] = useState<ActorTag[]>([])

  const [viewMode, setViewMode] = useState<VideosViewMode>(VideosViewMode.Loading)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [currentMassTaggerTag, setCurrentMassTaggerTag] = useState<VideosAppTag | null>(null)
  const [massTaggerScrollPosition, setMassTaggerScrollPosition] = useState<number>(0)
  const [massTaggerSortOrder, setMassTaggerSortOrder] = useState<VideosSortOrder>(VideosSortOrder.ID)
  const [massTaggerAnchorVideoId, setMassTaggerAnchorVideoId] = useState<number | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<IVideoSearchQuery>(getEmptyQuery())
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false)
  const [loadingModalText, setLoadingModalText] = useState<string>("")
  const [galleryPageSize, setGalleryPageSize] = useState<number>(12)
  const [playerSidebarCollapsed, setPlayerSidebarCollapsed] = useState<boolean>(false)

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
    const videos = await videosApi.fetchVideos()
    setAllVideos(videos)

    await refreshVideoTags()
    await refreshActorTags()

    await fillActors(videos)
    setAllSources(await videosApi.fetchSources())
  }

  const refreshVideoTags = async () => {
    setAllVideoTags(await videosApi.fetchVideoTags())
  }

  const refreshActorTags = async () => {
    setAllActorTags(await videosApi.fetchActorTags())
  }

  const fillActors = async (videos: Video[]) => {
    const actors = await videosApi.fetchActors(videos)
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


  //#endregion

  //#region API
  const updateVideo = async (video: Video) => {
    const updated = await videosApi.updateVideo(video)
    if (!updated) return
    console.log("Video " + video.id + " Updated")
    updateVideoActors(updated, allActors)
    const newVideos = allVideos.map(v => v.id === updated.id ? updated : v)
    setAllVideos(newVideos)
    if (currentVideo?.id === updated.id) {
      setCurrentVideo(updated)
    }
    await refreshVideoTags()
  }

  const updateActor = async (actor: Actor) => {
    const updated = await videosApi.updateActor(actor, allVideos)
    if (!updated) return
    console.log("Actor " + actor.id + " Updated")
    const newActors = allActors.map(a => a.id === updated.id ? updated : a)
    setAllActors(newActors)
    await refreshActorTags()
  }

  const deleteVideo = async (videoId: number) => {
    console.log('delete video with id: ' + videoId)
    const removed = await videosApi.deleteVideo(videoId)
    if (removed) {
      console.log('removed video ID: ' + videoId)
      setAllVideos(allVideos.filter((b) => b.id !== videoId))
      setCurrentVideo(null)
      setViewMode(VideosViewMode.Listing)
    }
  }

  const importVideos = async () => {
    console.log("Importing Videos")
    setViewMode(VideosViewMode.Loading)
    const videos = await videosApi.importVideos()
    if (videos) {
      setAllVideos(videos)
      setCurrentVideo(null)
      setViewMode(VideosViewMode.Listing)
    }
  }

  const setThumbnailToTime = async (videoId: number, timeMs: number) => {
    console.log('set thumbnail for video:' + videoId + ' to ' + timeMs + 'ms')
    setLoadingModal(true, "Generating thumbnail for video " + videoId)
    const result = await videosApi.generateVideoThumbnail(videoId, timeMs)
    if (result) {
      console.log('successfully updated thumbnail for: ' + videoId + " new thumb: " + result.thumbnailId)
      for (let i = 0; i < allVideos.length; i++) {
        if (allVideos[i] && allVideos[i].id === result.id) {
          let videos = allVideos
          videos[i].thumbnailId = result.thumbnailId
          videos[i].tags = videos[i].tags.filter(t => t.name !== 'Default Thumbnail')
          setAllVideos(videos)
          setShowLoadingModal(false)
        }
      }
    }
  }

  const generateImageForActor = async (videoId: number, actorId: number, timeMs: number) => {
    console.log('Generating image for actor: ' + actorId + " from video " + videoId + " @" + timeMs + 'ms')
    setLoadingModal(true, "Generating image for actor " + actorId)
    const result = await videosApi.generateActorImage(videoId, actorId, timeMs)
    if (result) {
      console.log('successfully generated  image for: ' + actorId + " new image: " + result.imageFile)
      for (let i = 0; i < allActors.length; i++) {
        if (allActors[i] && allActors[i].id === result.id) {
          let actors = allActors
          actors[i].imageFile = result.imageFile
          actors[i].imageUrl = await getActorImageUrlWithFallback(actors[i], allVideos)
          setAllActors(actors)
          setShowLoadingModal(false)
        }
      }
    }
  }

  const updateVideoTagImage = (tagId: number, imageFile: string) => {
    for (let i = 0; i < allVideoTags.length; i++) {
      if (allVideoTags[i] && allVideoTags[i].id === tagId) {
        let videoTags = allVideoTags
        videoTags[i].imageFile = imageFile
        setAllVideoTags(videoTags)
        break;
      }
    }
  }

  const updateActorTagImage = (tagId: number, imageFile: string) => {
    for (let i = 0; i < allActorTags.length; i++) {
      if (allActorTags[i] && allActorTags[i].id === tagId) {
        let videoTags = allActorTags
        videoTags[i].imageFile = imageFile
        setAllActorTags(allActorTags)
        break;
      }
    }
  }

  const generateImageForTag = async (tagId: number, tagType: TagType, videoId: number, timeMs: number) => {
    console.log(`Generating image for ${tagType} tag: ${tagId} from video ${videoId} @${timeMs}ms`)
    setLoadingModal(true, `Generating image for ${tagType} tag ${tagId}`)
    const imageFile = await videosApi.generateTagImage(tagId, tagType, videoId, timeMs)
    if (imageFile != null) {
      console.log(`Successfully generated and updated tag image for tag ${tagId} - new image: ${imageFile}`)
      if (tagType === 'Video') {
        updateVideoTagImage(tagId, imageFile)
      } else {
        updateActorTagImage(tagId, imageFile)
      }
      setShowLoadingModal(false)
    }
  }

  const uploadSourceImage = async (sourceId: number, imageSize: 'small' | 'large', fileData: FileWithData) => {
    setLoadingModal(true, `Uploading image for source: ${sourceId}`)
    const source = await videosApi.uploadSourceImage(sourceId, imageSize, fileData)
    if (source) {
      for (let i = 0; i < allSources.length; i++) {
        if (allSources[i] && allSources[i].id === source.id) {
          let sources = allSources
          sources[i] = source
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
      setViewMode(VideosViewMode.VideoSearchResults)
    } else if (currentSearchQuery.filled) {
      setViewMode(VideosViewMode.VideoSearchResults)
    }
  }

  const massTag = (tag: VideosAppTag) => {
    setCurrentMassTaggerTag(tag)
    if (viewMode !== VideosViewMode.MassTagger) {
      setViewMode(VideosViewMode.MassTagger)
    }
  }

  const viewListing = () => { setViewMode(VideosViewMode.Listing) }

  const viewActors = () => { setViewMode(VideosViewMode.Actors) }

  const viewSources = () => { setViewMode(VideosViewMode.Sources) }

  const viewTags = () => { setViewMode(VideosViewMode.Tags) }

  const viewMassTagger = () => { setViewMode(VideosViewMode.MassTagger) }

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
      viewMode: VideosViewMode.VideoSearchResults,
      clickHandler: viewSearchResults
    }
  ]

  const rightNavItems: NavItem[] = [
    {
      text: "Mass Tagger",
      viewMode: VideosViewMode.MassTagger,
      clickHandler: viewMassTagger
    },
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
    setMassTaggerTag: massTag,
    setMassTaggerScrollPosition: setMassTaggerScrollPosition,
    setMassTaggerSortOrder: setMassTaggerSortOrder,
    setMassTaggerAnchorVideoId: setMassTaggerAnchorVideoId,
    setVideoListingPage: (n: number) => { setVideoListingPage(n) },
    setActorListingPage: (n: number) => { setActorListingPage(n) },
    setLoadingModal: setLoadingModal,
    setPlayerSidebarCollapsed: setPlayerSidebarCollapsed,

    updateVideo: updateVideo,
    deleteVideo: deleteVideo,
    setThumbnailToTime: setThumbnailToTime,
    updateActor: updateActor,
    generateImageForActor: generateImageForActor,
    generateImageForTag: generateImageForTag,
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
    currentMassTaggerTag: currentMassTaggerTag,
    massTaggerScrollPosition: massTaggerScrollPosition,
    massTaggerSortOrder: massTaggerSortOrder,
    massTaggerAnchorVideoId: massTaggerAnchorVideoId,
    currentSearchQuery: currentSearchQuery,
    showLoadingModal: showLoadingModal,
    loadingModalText: loadingModalText,
    playerSidebarCollapsed: playerSidebarCollapsed,
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
        <div className="view-content">
          <MultiView
            viewMode={viewMode}
            galleryPageSize={galleryPageSize}
            currentSearchQuery={currentSearchQuery} />
        </div>
      </div>
    </VideosAppContext>
  )
}

export default VideosApp;
