import type { IVideoSearchQuery } from "../../../interfaces/searchQuery"
import type IVideo from "../../../interfaces/video"
import { VideosSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import VideoGalleryItem from "./videoGalleryItem"
import type IActor from "../../../interfaces/actor"
import VideoSortControls from "./videoSortControls"
import ActorDetail from "./actorDetail"
import { useContext, useEffect, useRef, useState } from "react"
import type IVideoSource from "../../../interfaces/videoSource"
import SourceDetail from "./sourceDetail"
import { VideosAppContext } from "../videosAppContext"
import { scalarArrayCompare } from "../../../util/helpers"
import { BitArray } from "../../../util/bitArray"

interface VideoGalleryProps {
    pageSize: number,
    showFilters?: boolean,
    sortOrder?: VideosSortOrder,
    query?: IVideoSearchQuery,
}

const VideoGallery = (props: VideoGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? VideosSortOrder.Favorite

    const appContext = useContext(VideosAppContext)

    const [items, setItems] = useState<IVideo[]>([])
    const [galleryPage, setGalleryPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [sortOrder, setSortOrder] = useState<VideosSortOrder>(initialSortOrder)
    const [actorListingActor, setActorListingActor] = useState<IActor | null>(null)
    const [sourceListingSource, setSourceListingSource] = useState<IVideoSource | null>(null)
    const [imageLoadState, setImageLoadState] = useState<BitArray>(new BitArray(props.pageSize))
    const [disabledSortOrders, setDisabledSortOrder] = useState<VideosSortOrder[]>([])

    const previousVideos = useRef([] as IVideo[])
    const previousQuery = useRef({} as IVideoSearchQuery | undefined)


    useEffect(() => {
        updateItems(appContext.allVideos, props.query)
        console.log(`VideoGallery update triggered`)
    }, [appContext.allVideos, props.query])

    useEffect(() => {
        appContext.setLoadingModal(true, "Loading Images")
    }, [items, galleryPage, appContext.videoListingPage])

    useEffect(() => {
        //console.log(`update image load state: [${imageLoadState.getBits().map(b => b ? 1 : 0).join(',')}]`)
        if (imageLoadState.allTrue()) {
            appContext.setLoadingModal(false)
        }
    }, [imageLoadState])

    const updateItems = (videos: IVideo[], query?: IVideoSearchQuery) => {
        if (query) {
            const newIds = videos.map(v => v.id)
            const oldIds = previousVideos.current.map(v => v.id)
            if (!previousQuery.current || !scalarArrayCompare(newIds, oldIds)) {
                const filteredVideos = getFilteredVideos(videos, query)
                const sortedVideos = getSortedVideos(filteredVideos, sortOrder)
                setItems(sortedVideos)
                setTotalPages(getTotalPages(sortedVideos))
                setGalleryPage(0)
                updateActorListingActor()
                updateSourceListingSource()
                setImageLoadState(new BitArray(Math.min(props.pageSize, filteredVideos.length)))
            }
        } else {
            const newIds = videos.map(v => v.id)
            const oldIds = previousVideos.current.map(v => v.id)
            if (previousQuery.current || !scalarArrayCompare(newIds, oldIds)) {
                setItems(getSortedVideos(videos, initialSortOrder))
                setTotalPages(getTotalPages(videos))
                setGalleryPage(0)
                updateActorListingActor()
                updateSourceListingSource()
            }
        }
        previousVideos.current = videos
        previousQuery.current = query
    }

    const getSortedVideos = (Videos: IVideo[], sortOrder: VideosSortOrder): IVideo[] => {
        let sortedCopy = [...Videos]
        switch (sortOrder) {
            case VideosSortOrder.Title:
                sortedCopy.sort((a, b) => {
                    return a.title.localeCompare(b.title)
                })
                break
            case VideosSortOrder.Actor:
                sortedCopy.sort((a, b) => {
                    if (a.actors.length < 1 && b.actors.length > 0) return -1
                    if (a.actors.length > 0 && b.actors.length < 1) return 1
                    if (a.actors.length < 1 && b.actors.length < 1) return 0
                    return a.actors[0].name.localeCompare(b.actors[0].name)
                })
                break
            case VideosSortOrder.Source:
                sortedCopy.sort((a, b) => {
                    return a.source.id - b.source.id
                })
                break
            case VideosSortOrder.ID:
                sortedCopy.sort((a, b) => {
                    return a.id - b.id
                })
                break
            case VideosSortOrder.Random:
                sortedCopy.sort(() => {
                    return 0.5 - Math.random()
                })
                break
            case VideosSortOrder.Favorite:
                sortedCopy.sort(() => {
                    return 0.5 - Math.random()
                })
                let favorites = sortedCopy.filter(b => b.isFavorite)
                let other = sortedCopy.filter(b => !b.isFavorite)
                sortedCopy = favorites.concat(other)
                break
            case VideosSortOrder.Date:
                sortedCopy.sort((a, b) => {
                    return b.addedDate.getTime() - a.addedDate.getTime()
                })
                break
            default:
                console.log("getSortedVideos - Invalid Sort Order")
        }
        return sortedCopy
    }

    const getFilteredVideos = (videos: IVideo[], searchQuery?: IVideoSearchQuery): IVideo[] => {
        let results = videos
        if (!searchQuery) return results
        if (searchQuery.actor) {
            results = results.filter(video => {
                if (video.actors) {
                    let match = video.actors.filter((a) => a.name.toLowerCase() === searchQuery.actor!.toLowerCase())
                    if (match.length > 0) {
                        return true
                    }
                    //return video.artists.some((a) => a.toLowerCase() === searchQuery.artist!.toLowerCase())
                }
                return false
            })
        }
        if (searchQuery.source) {
            results = results.filter(video => {
                return video.source.name.toLowerCase() == searchQuery.source!.toLowerCase()
            })
        }
        if (searchQuery.tag) {
            results = results.filter(video => {
                if (video.tags) {
                    return video.tags.some((a) => a.name.toLowerCase() === searchQuery.tag!.toLowerCase())
                }
                return false
            })
        }
        if (searchQuery.text) {
            results = results.filter(video => {
                if (video.searchTerms) {
                    return video.searchTerms.some((a) => a.toLowerCase() === searchQuery.text?.toLowerCase())
                }
                return false
            })
        }
        return results
    }

    const sortVideos = (order: VideosSortOrder) => {
        if (sortOrder !== order || order === VideosSortOrder.Random || order === VideosSortOrder.Favorite) {
            const videos = props.query ? getFilteredVideos(appContext.allVideos, props.query) : appContext.allVideos
            setItems(getSortedVideos(videos, order))
            setSortOrder(order)
            setGalleryPage(0)
        }
    }

    const getTotalPages = (Videos: IVideo[]): number => {
        if (Videos) {
            return Math.max(1, Math.ceil(Videos.length / props.pageSize))
        }
        return 1
    }

    const setPage = (pageNum: number) => {
        if (props.query) {
            setGalleryPage(pageNum)
        } else {
            appContext.setVideoListingPage(pageNum)
        }
    }

    const getGalleryPage = () => {
        return props.query ? galleryPage : appContext.videoListingPage
    }

    const getCurrentGalleryPageItems = (videos: IVideo[]): IVideo[] => {
        let pageStart = getGalleryPage() * props.pageSize;
        let pageEnd = (getGalleryPage() + 1) * props.pageSize;

        const galleryItems = videos.slice(pageStart, pageEnd)
        return galleryItems
    }

    const bodyClick = (Video: IVideo) => {
        appContext.watchVideo(Video)
    }

    const subtitleClick = (a: IActor) => {
        appContext.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (video: IVideo) => {
        console.log("toggle favorite for video: " + video.id)

        video.isFavorite = !video.isFavorite; //toggle value
        appContext.updateVideo(video)
    }

    const onImageLoad = (idx: number) => {
        setImageLoadState(prev => prev.toggle(idx))
    }

    const updateActorListingActor = () => {
        const isActorListing = props.query &&
            props.query.filled &&
            props.query.actor &&
            !props.query.source &&
            !props.query.tag
        if (!isActorListing) {
            setActorListingActor(null)
            setDisabledSortOrder(prev => prev.filter(s => s !== "AlphaActor"))
            return
        }
        const matchingActor = appContext.allActors.find(a => a.name == props.query!.actor) ?? null
        setActorListingActor(matchingActor)
        setDisabledSortOrder(prev => [...prev, "AlphaActor"])
    }

    const updateSourceListingSource = () => {
        const isSourceListing = props.query &&
            props.query.filled &&
            props.query.source &&
            !props.query.actor &&
            !props.query.tag
        if (!isSourceListing) {
            setSourceListingSource(null)
            setDisabledSortOrder(prev => prev.filter(s => s !== "AlphaSource"))
            return
        }
        const matchingSource = appContext.allSources.find(s => s.name === props.query!.source) ?? null
        setSourceListingSource(matchingSource)
        setDisabledSortOrder(prev => [...prev, "AlphaSource"])
    }

    return (
        <div className="videogallery-container dark-theme">
            {
                actorListingActor ?
                    <ActorDetail actor={actorListingActor} />
                    : null
            }
            {
                sourceListingSource ?
                    <SourceDetail
                        source={sourceListingSource}
                    />
                    : null
            }
            <div className="videogallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={getGalleryPage()} />
                {
                    props.sortOrder ? null :
                        <VideoSortControls sortOrder={sortOrder}
                            videoList={items}
                            pageSize={props.pageSize}
                            sortVideos={sortVideos}
                            setPage={setPage}
                            disabledSorts={disabledSortOrders} />
                }
            </div>
            <div className="videogallery-container-inner" style={{ 'visibility': (appContext.showLoadingModal ? 'hidden' : 'visible') }}>
                {
                    getCurrentGalleryPageItems(items).map((video, i) => {
                        return <VideoGalleryItem
                            key={i}
                            index={i}
                            video={video}
                            bodyClickHandler={bodyClick}
                            subTitleItemClickHandler={subtitleClick}
                            favoriteClickHandler={favoriteClick}
                            onImageLoad={onImageLoad}
                        ></VideoGalleryItem>
                    })
                }
            </div>
            <div className="videogallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={getGalleryPage()}></PageSelect>
            </div>
        </div>
    )
}

export default VideoGallery