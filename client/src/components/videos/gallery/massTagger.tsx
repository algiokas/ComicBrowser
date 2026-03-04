import { useContext, useEffect, useMemo, useState } from "react";
import type { VideosAppTag, VideoTag } from "../../../types/tags";
import type { Video } from "../../../types/video";
import { VideosAppContext } from "../videosAppContext";
import VideoSortControls from "./videoSortControls";
import { VideosSortOrder } from "../../../util/enums";
import VideoGalleryItem from "./videoGalleryItem";
import EyeImage from "../../../img/svg/eye-fill.svg"


interface MassTaggerProps {
    sortOrder?: VideosSortOrder;
}

const MassTagger = (props: MassTaggerProps) => {
    const appContext = useContext(VideosAppContext)

    const initialSortOrder = props.sortOrder ?? VideosSortOrder.ID
    const [sortOrder, setSortOrder] = useState<VideosSortOrder>(initialSortOrder)

    const handleScroll = () => {
        //console.log('scroll test ' + window.scrollY)
        appContext.setMassTaggerScrollPosition(window.scrollY)
    }

    useEffect(() => {
        console.log('Scroll To: ' + appContext.massTaggerScrollPosition)
        window.scrollTo(0, appContext.massTaggerScrollPosition)
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const bodyClick = (video: Video) => {
        if (appContext.currentMassTaggerTag && appContext.currentMassTaggerTag.tagType === "video") {
            video.tags.push(appContext.currentMassTaggerTag)
            appContext.updateVideo(video)
        }
    }

    const secondaryClick = (video: Video) => {
        appContext.watchVideo(video)
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

    const sortedVideos = useMemo(() => {
        return getSortedVideos();
    }, [appContext.allVideos, sortOrder]);

    const scrollTop = () => {
        window.scrollTo(0, 0)
    }

    const sortVideos = (order: VideosSortOrder) => {
        setSortOrder(order)
    }

    const setTagToApply = (tagId: string) => {
        const tag = appContext.allVideoTags.find(t => t.id.toString() === tagId)
        if (tag) {
            appContext.setMassTaggerTag(tag)
        }
    }

    const containsTag = (video: Video): boolean => {
        return video.tags.some(t => t.id === appContext.currentMassTaggerTag?.id)
    }

    const alphaSort = (a: VideosAppTag, b: VideosAppTag): number => {
        return a.name.localeCompare(b.name)
    }



    return (
        <div className="videogallery-container dark-theme">
            <div className="tag-select-container">
                <div className="tag-select-inner">
                    <select className="tag-select"
                        id="tag-select-dropdown"
                        onChange={(e) => setTagToApply(e.target.value)}
                        value={appContext.currentMassTaggerTag?.id ?? 0}>
                        {
                            appContext.allVideoTags.toSorted(alphaSort).map((t, i) => {
                                return <option value={t.id} key={i}>{t.name}</option>
                            })
                        }
                    </select>
                </div>
            </div>
            <div className="videogallery-container-header">
                <VideoSortControls sortOrder={sortOrder}
                    videoList={appContext.allVideos}
                    pageSize={appContext.allVideos.length}
                    sortVideos={sortVideos}
                    setPage={scrollTop} />
            </div>
            <div className="videogallery-container-inner"
                style={{ 'visibility': (appContext.showLoadingModal ? 'hidden' : 'visible') }}>
                {
                    sortedVideos.filter(v => !containsTag(v)).map((video, i) => {
                        return <VideoGalleryItem
                            key={i}
                            index={i}
                            video={video}
                            bodyClickHandler={bodyClick}
                            lazyload={true}
                            secondaryClickHandler={secondaryClick}
                            secondaryClickIconUrl={EyeImage}
                        ></VideoGalleryItem>
                    })
                }
            </div>
        </div>
    )
}

export default MassTagger