import type { IVideoSearchQuery } from "../../../types/searchQuery"
import type { Video } from "../../../types/video"
import { VideosSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import VideoGalleryItem from "./videoGalleryItem"
import type { Actor } from "../../../types/actor"
import VideoSortControls from "./videoSortControls"
import ActorDetail from "./actorDetail"
import { useContext, useEffect, useRef, useState } from "react"
import type { VideoSource } from "../../../types/videoSource"
import SourceDetail from "./sourceDetail"
import { VideosAppContext } from "../../../context/videosAppContext"
import { scalarArrayCompare } from "../../../util/helpers"
import { BitArray } from "../../../util/bitArray"

interface VideoGalleryProps {
    pageSize: number,
    showFilters?: boolean,
    sortOrder?: VideosSortOrder,
    query?: IVideoSearchQuery,
}

// When a video listing is filtered down to a single actor/source, ActorDetail
// /SourceDetail take up the height of one thumbnail row (see .detail-active
// in gallery.scss), so only 2 rows (8 items) fit instead of the usual 3.
const DETAIL_LISTING_PAGE_SIZE = 8

const VideoGallery = (props: VideoGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? VideosSortOrder.Random

    const appContext = useContext(VideosAppContext)

    const [items, setItems] = useState<Video[]>([])
    const [galleryPage, setGalleryPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [sortOrder, setSortOrder] = useState<VideosSortOrder>(initialSortOrder)
    const [actorListingActor, setActorListingActor] = useState<Actor | null>(null)
    const [sourceListingSource, setSourceListingSource] = useState<VideoSource | null>(null)
    const [imageLoadState, setImageLoadState] = useState<BitArray>(new BitArray(props.pageSize))
    const [disabledSortOrders, setDisabledSortOrder] = useState<VideosSortOrder[]>([])

    const previousVideos = useRef([] as Video[])
    const previousQuery = useRef({} as IVideoSearchQuery | undefined)

    const isDetailListing = actorListingActor !== null || sourceListingSource !== null
    const effectivePageSize = isDetailListing ? DETAIL_LISTING_PAGE_SIZE : props.pageSize


    useEffect(() => {
        updateItems(appContext.allVideos, props.query)
        console.log(`VideoGallery update triggered`)
    }, [appContext.allVideos, props.query])

    useEffect(() => {
        const pageItemCount = getCurrentGalleryPageItems(items).length
        setImageLoadState(new BitArray(pageItemCount))
        appContext.setLoadingModal(true, "Loading Images")

        const timeout = setTimeout(() => {
            appContext.setLoadingModal(false)
        }, 8000)
        return () => clearTimeout(timeout)
    }, [items, galleryPage, appContext.videoListingPage])

    useEffect(() => {
        //console.log(`update image load state: [${imageLoadState.getBits().map(b => b ? 1 : 0).join(',')}]`)
        if (imageLoadState.allTrue()) {
            appContext.setLoadingModal(false)
        }
    }, [imageLoadState])

    const updateItems = (videos: Video[], query?: IVideoSearchQuery) => {
        if (query) {
            const newIds = videos.map(v => v.id)
            const oldIds = previousVideos.current.map(v => v.id)
            if (!previousQuery.current || !scalarArrayCompare(newIds, oldIds)) {
                const isActorListing = updateActorListingActor()
                const isSourceListing = updateSourceListingSource()
                const filteredVideos = getFilteredVideos(videos, query)
                if (isActorListing || isSourceListing)
                    setSortOrder("Favorite")
                const sortedVideos = getSortedVideos(filteredVideos, isActorListing || isSourceListing ? "Favorite" : sortOrder)
                const pageSize = (isActorListing || isSourceListing) ? DETAIL_LISTING_PAGE_SIZE : props.pageSize
                setItems(sortedVideos)
                setTotalPages(getTotalPages(sortedVideos, pageSize))
                setGalleryPage(0)
            }
        } else {
            const newIds = videos.map(v => v.id)
            const oldIds = previousVideos.current.map(v => v.id)
            if (previousQuery.current || !scalarArrayCompare(newIds, oldIds)) {
                updateActorListingActor()
                updateSourceListingSource()
                setItems(getSortedVideos(videos, initialSortOrder))
                setTotalPages(getTotalPages(videos, props.pageSize))
                setGalleryPage(0)
            }
        }
        previousVideos.current = videos
        previousQuery.current = query
    }

    const getSortedVideos = (Videos: Video[], sortOrder: VideosSortOrder): Video[] => {
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

    const getFilteredVideos = (videos: Video[], searchQuery?: IVideoSearchQuery): Video[] => {
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

    const getTotalPages = (Videos: Video[], pageSize: number): number => {
        if (Videos) {
            return Math.max(1, Math.ceil(Videos.length / pageSize))
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

    const getCurrentGalleryPageItems = (videos: Video[]): Video[] => {
        let pageStart = getGalleryPage() * effectivePageSize;
        let pageEnd = (getGalleryPage() + 1) * effectivePageSize;

        const galleryItems = videos.slice(pageStart, pageEnd)
        return galleryItems
    }

    const bodyClick = (Video: Video) => {
        appContext.watchVideo(Video)
    }

    const subtitleClick = (a: Actor) => {
        appContext.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (video: Video) => {
        console.log("toggle favorite for video: " + video.id)

        video.isFavorite = !video.isFavorite; //toggle value
        appContext.updateVideo(video)
    }

    const onImageResolved = (idx: number) => {
        setImageLoadState(prev => prev.set(idx, true))
    }

    const updateActorListingActor = (): boolean => {
        const isActorListing = props.query &&
            props.query.filled &&
            props.query.actor &&
            !props.query.source &&
            !props.query.tag
        if (!isActorListing) {
            setActorListingActor(null)
            setDisabledSortOrder(prev => prev.filter(s => s !== "AlphaActor"))
            return false
        }
        const matchingActor = appContext.allActors.find(a => a.name == props.query!.actor) ?? null
        setActorListingActor(matchingActor)
        setDisabledSortOrder(prev => [...prev, "AlphaActor"])
        return true
    }

    const updateSourceListingSource = (): boolean => {
        const isSourceListing = props.query &&
            props.query.filled &&
            props.query.source &&
            !props.query.actor &&
            !props.query.tag
        if (!isSourceListing) {
            setSourceListingSource(null)
            setDisabledSortOrder(prev => prev.filter(s => s !== "AlphaSource"))
            return false
        }
        const matchingSource = appContext.allSources.find(s => s.name === props.query!.source) ?? null
        setSourceListingSource(matchingSource)
        setDisabledSortOrder(prev => [...prev, "AlphaSource"])
        return true
    }

    return (
        <div className="video-gallery-container dark-theme">
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
            <div className="video-gallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={getGalleryPage()} />
                {
                    props.sortOrder ? null :
                        <VideoSortControls sortOrder={sortOrder}
                            videoList={items}
                            pageSize={effectivePageSize}
                            sortVideos={sortVideos}
                            setPage={setPage}
                            disabledSorts={disabledSortOrders} />
                }
            </div>
            <div
                className={isDetailListing ? "video-gallery-container-inner detail-active" : "video-gallery-container-inner"}
                style={{ 'visibility': (appContext.showLoadingModal ? 'hidden' : 'visible') }}>
                {
                    getCurrentGalleryPageItems(items).map((video, i) => {
                        return <VideoGalleryItem
                            key={video.id}
                            index={i}
                            data={video}
                            bodyClickHandler={bodyClick}
                            subTitleItemClickHandler={subtitleClick}
                            favoriteClickHandler={favoriteClick}
                            onImageLoad={onImageResolved}
                            onImageError={onImageResolved}
                        ></VideoGalleryItem>
                    })
                }
            </div>
            <div className="video-gallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={getGalleryPage()}></PageSelect>
            </div>
        </div>
    )
}

export default VideoGallery