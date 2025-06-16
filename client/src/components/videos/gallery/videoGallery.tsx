import { IVideoSearchQuery } from "../../../interfaces/searchQuery"
import IVideo from "../../../interfaces/video"
import { VideosSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import VideoGalleryItem from "./videoGalleryItem"
import { BaseGalleryProps } from "../../shared/baseGallery"
import IActor from "../../../interfaces/actor"
import VideoSortControls from "./videoSortControls"
import ActorDetail from "./actorDetail"
import { getVideoThumbnailUrl } from "../../../util/helpers"
import { useEffect, useState } from "react"

export interface VideoGalleryProps extends BaseGalleryProps<IVideo> {
    sortOrder?: VideosSortOrder,
    query?: IVideoSearchQuery,
    watchVideo(Video: IVideo): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    updateVideo?: (Video: IVideo) => void,
    updateActor?: (actor: IActor) => void,
    getActorImageUrl(actor: IActor): string
}

const VideoGallery = (props: VideoGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? VideosSortOrder.Favorite

    const [ items, setItems ] = useState<IVideo[]>([])
    const [ galleryPage, setGalleryPage ] = useState<number>(0)
    const [ totalPages, setTotalPages ] = useState<number>(0)
    const [ sortOrder, setSortOrder ] = useState<VideosSortOrder>(initialSortOrder)
    const [ actorListingActor, setActorListingActor ] = useState<IActor | null>(null)
    const [ currentPageSize, setCurrentPageSize ] = useState<number>(props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize)

    useEffect(() => {
        updateItems(props.allItems, props.query)
    }, [props.allItems, props.query])

    const updateItems = (videos: IVideo[], query?: IVideoSearchQuery) => {
        if (query) {
            const filteredVideos = getFilteredVideos(videos, query)
            const sortedVideos = getSortedVideos(filteredVideos, sortOrder)
            setItems(sortedVideos)
            setTotalPages(getTotalPages(sortedVideos))
            setGalleryPage(0)
            updateActorListingActor(sortedVideos)
        } else {
            const sortedVideos = getSortedVideos(videos, sortOrder)
            setItems(getSortedVideos(videos, sortOrder))
            setTotalPages(getTotalPages(videos))
            setGalleryPage(0)  
            updateActorListingActor(sortedVideos)
        }
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
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                break
            case VideosSortOrder.Favorite:
                sortedCopy.sort((a, b) => {
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
                    return video.tags.some((a) => a.toLowerCase() === searchQuery.tag!.toLowerCase())
                }
                return false
            })
        }
        return results
    }

    const sortVideos = (order: VideosSortOrder) => {
        if (sortOrder !== order || order === VideosSortOrder.Random || order === VideosSortOrder.Favorite) {
            setItems(getSortedVideos(props.allItems, order))
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
        setGalleryPage(pageNum)
    }

    const getCurrentGalleryPage = (videos: IVideo[]): IVideo[] => {
        let pageStart = galleryPage * props.pageSize;
        let pageEnd = (galleryPage + 1) * props.pageSize;
        return videos.slice(pageStart, pageEnd)
    }

    const bodyClick = (Video: IVideo, VideoIndex: number) => {
        props.watchVideo(Video)
    }

    const subtitleClick = (a: IActor) => {
        props.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (video: IVideo) => {
        console.log("toggle favorite for video: " + video.id)
        if (props.updateVideo) {
            video.isFavorite = !video.isFavorite; //toggle value
            props.updateVideo(video)
        }
    }

    const updateActorListingActor = (videos: IVideo[]) => {
        const isActorListing = props.query &&
            props.query.filled &&
            props.query.actor &&
            !props.query.source &&
            !props.query.tag
        if (!isActorListing) return
        const firstVideo = getCurrentGalleryPage(videos)[0]
        const listingActor = firstVideo.actors.find(a => a.name == props.query!.actor) ?? null
        setActorListingActor(listingActor)
    }

    return (
        <div className="videogallery-container dark-theme">
            {
                actorListingActor ?
                    <ActorDetail actor={actorListingActor}
                        getActorImageUrl={props.getActorImageUrl}
                        updateActor={props.updateActor} />
                    : null
            }
            <div className="videogallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={galleryPage} />
                {
                    props.sortOrder ? null :
                        <VideoSortControls sortOrder={sortOrder}
                            videoList={items}
                            pageSize={props.pageSize}
                            sortVideos={sortVideos}
                            setPage={setPage} />
                }
            </div>
            <div className="videogallery-container-inner">
                {getCurrentGalleryPage(items).map((video, i) => {
                    return <VideoGalleryItem
                        key={i}
                        index={i}
                        data={video}
                        imageUrl={getVideoThumbnailUrl(video)}
                        bodyClickHandler={bodyClick}
                        subTitleItemClickHandler={subtitleClick}
                        favoriteClickHandler={favoriteClick}
                    ></VideoGalleryItem>
                })

                }
            </div>
            <div className="videogallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={galleryPage}></PageSelect>
            </div>
        </div>
    )
}

export default VideoGallery