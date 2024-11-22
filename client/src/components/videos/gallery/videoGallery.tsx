import { IVideoSearchQuery } from "../../../interfaces/searchQuery"
import IVideo from "../../../interfaces/video"
import { VideosSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import VideoGalleryItem from "./videoGalleryItem"
import BaseGallery, { BaseGalleryProps, BaseGalleryState } from "./baseGallery"
import IActor from "../../../interfaces/actor"
import VideoSortControls from "./videoSortControls"
import ActorDetail from "./actorDetail"

export interface VideoGalleryProps extends BaseGalleryProps<IVideo> {
    sortOrder?: VideosSortOrder,
    query?: IVideoSearchQuery,
    watchVideo(Video: IVideo): void,
    viewSearchResults(query?: IVideoSearchQuery): void,
    updateVideo?: (Video: IVideo) => void,
    getActorImageUrl(actor: IActor): string
}

export interface VideoGalleryState extends BaseGalleryState<IVideo> {
    sortOrder: VideosSortOrder
}

class VideoGallery extends BaseGallery<IVideo, VideoGalleryProps, VideoGalleryState> {
    constructor(props: VideoGalleryProps) {
        super(props)

        let initialSortOrder = props.sortOrder ?? VideosSortOrder.Favorite

        let initialState: VideoGalleryState = {
            galleryPage: 0,
            currentPageSize: props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize,
            items: [],
            totalPages: 0,
            sortOrder: initialSortOrder
        }

        if (props.query) {
            let filteredVideos = this.getFilteredVideos(props.allItems, props.query)
            initialState.items = this.getSortedVideos(filteredVideos, initialSortOrder)
            initialState.totalPages = this.getTotalPages(filteredVideos)
        } else {
            initialState.items = this.getSortedVideos(props.allItems, initialSortOrder)
            initialState.totalPages = this.getTotalPages(props.allItems)
        }
        this.state = initialState
    }

    componentDidUpdate(prevProps: Readonly<VideoGalleryProps>, prevState: Readonly<VideoGalleryState>, snapshot?: any): void {
        if (prevProps.allItems !== this.props.allItems || prevProps.query !== this.props.query) {
            if (this.props.query) {
                let filteredVideos = this.getFilteredVideos(this.props.allItems, this.props.query)
                this.setState({
                    galleryPage: 0,
                    items: this.getSortedVideos(filteredVideos, this.state.sortOrder),
                    totalPages: this.getTotalPages(filteredVideos)
                })
            } else {
                this.setState({
                    galleryPage: 0,
                    items: this.getSortedVideos(this.props.allItems, VideosSortOrder.Favorite),
                    totalPages: this.getTotalPages(this.props.allItems),
                    sortOrder: VideosSortOrder.Favorite
                })
            }
        }
    }

    getSortedVideos = (Videos: IVideo[], sortOrder: VideosSortOrder): IVideo[] => {
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

    getFilteredVideos = (videos: IVideo[], searchQuery?: IVideoSearchQuery): IVideo[] => {
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

    sortVideos = (order: VideosSortOrder) => {
        if (this.state.sortOrder !== order || order === VideosSortOrder.Random || order === VideosSortOrder.Favorite) {
            this.setState({
                galleryPage: 0,
                items: this.getSortedVideos(this.props.allItems, order),
                sortOrder: order
            })
        }
    }

    getThumbnailUrl = (video: IVideo) => {
        return process.env.REACT_APP_VIDEOS_API_BASE_URL + "videos/thumbnail/" + video.id
    }

    getTotalPages = (Videos: IVideo[]): number => {
        if (Videos) {
            return Math.max(1, Math.ceil(Videos.length / this.props.pageSize))
        }
        return 1
    }

    getPageSize = (pageNum: number): number => {
        if (pageNum < this.state.totalPages - 1) {
            return this.props.pageSize
        } else {
            return this.state.items.length % this.props.pageSize
        }
    }

    setPage = (pageNum: number) => {
        this.setState({
            galleryPage: pageNum
        })
    }

    getCurrentgalleryPage = (): IVideo[] => {
        let pageStart = this.state.galleryPage * this.props.pageSize;
        let pageEnd = (this.state.galleryPage + 1) * this.props.pageSize;
        return this.state.items.slice(pageStart, pageEnd)
    }

    bodyClick = (Video: IVideo, VideoIndex: number) => {
        this.props.watchVideo(Video)
    }

    subtitleClick = (a: IActor) => {
        this.props.viewSearchResults({ actor: a.name })
    }

    favoriteClick = (video: IVideo) => {
        console.log("toggle favorite for video: " + video.id)
        if (this.props.updateVideo) {
            video.isFavorite = !video.isFavorite; //toggle value
            this.props.updateVideo(video)
        }
    }

    getActorListingActor = () => {
        let isActorListing = this.props.query &&
            this.props.query.filled &&
            this.props.query.actor &&
            !this.props.query.source &&
            !this.props.query.tag
        if (!isActorListing) return null
        let firstVideo = this.getCurrentGalleryPage()[0]
        return firstVideo.actors.find(a => a.name == this.props.query!.actor)
    }

    render() {
        let actorListingActor = this.getActorListingActor()
        return (
            <div className="videogallery-container dark-theme">
                {
                    actorListingActor ?
                        <ActorDetail actor={actorListingActor}
                            getActorImageUrl={this.props.getActorImageUrl} />
                        : null
                }
                <div className="videogallery-container-header">
                    <PageSelect
                        setPage={this.setPage}
                        totalPages={this.state.totalPages}
                        currentPage={this.state.galleryPage} />
                    {
                        this.props.sortOrder ? null :
                            <VideoSortControls sortOrder={this.state.sortOrder}
                                videoList={this.state.items}
                                pageSize={this.props.pageSize}
                                sortVideos={this.sortVideos}
                                setPage={this.setPage} />
                    }
                </div>
                <div className="videogallery-container-inner">
                    {this.getCurrentgalleryPage().map((video, i) => {
                        return <VideoGalleryItem
                            key={i}
                            index={i}
                            data={video}
                            imageUrl={this.getThumbnailUrl(video)}
                            bodyClickHandler={this.bodyClick}
                            subTitleItemClickHandler={this.subtitleClick}
                            favoriteClickHandler={this.favoriteClick}
                        ></VideoGalleryItem>
                    })

                    }
                </div>
                <div className="videogallery-container-footer">
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default VideoGallery