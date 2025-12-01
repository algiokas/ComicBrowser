import { useContext, useState } from "react";
import type { VideoTag } from "../../../types/tags";
import type { Video } from "../../../types/video";
import { VideosAppContext } from "../videosAppContext";
import VideoSortControls from "./videoSortControls";
import { VideosSortOrder } from "../../../util/enums";
import VideoGalleryItem from "./videoGalleryItem";


interface MassTaggerProps {
    sortOrder?: VideosSortOrder;
}

const MassTagger = (props: MassTaggerProps) => {
    const appContext = useContext(VideosAppContext)

    const initialSortOrder = props.sortOrder ?? VideosSortOrder.ID
    const [sortOrder, setSortOrder] = useState<VideosSortOrder>(initialSortOrder)

    const bodyClick = (video: Video) => {
        if (appContext.currentMassTaggerTag && appContext.currentMassTaggerTag.tagType === "video") {
            video.tags.push(appContext.currentMassTaggerTag)
            appContext.updateVideo(video)
        }
    }

    const getSortedVideos = (): Video[] => {
        let sortedCopy = [...appContext.allVideos]
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

    const scrollTop = () => {
        window.scrollTo(0, 0)
    }

    const sortVideos = (order: VideosSortOrder) => {
        setSortOrder(order)
    }

    return (
        <div className="videogallery-container dark-theme">
            <div className="videogallery-container-header">
                <VideoSortControls sortOrder={sortOrder}
                    videoList={appContext.allVideos}
                    pageSize={appContext.allVideos.length}
                    sortVideos={sortVideos}
                    setPage={scrollTop}/>
            </div>
            <div className="videogallery-container-inner" style={{ 'visibility': (appContext.showLoadingModal ? 'hidden' : 'visible') }}>
                {
                    getSortedVideos().map((video, i) => {
                        return <VideoGalleryItem
                            key={i}
                            index={i}
                            video={video}
                            bodyClickHandler={bodyClick}
                        ></VideoGalleryItem>
                    })
                }
            </div>
        </div>
    )
}

export default MassTagger