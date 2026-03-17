import { useContext, useEffect, useMemo, useState, useRef } from "react";
import type { VideosAppTag } from "../../../types/tags";
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
    const [shuffleVersion, setShuffleVersion] = useState(0);

    const randomWeights = useRef<Map<number, number>>(new Map());

    const reshuffle = () => {
        randomWeights.current.clear();
        setShuffleVersion(v => v + 1);
    };

    const getWeight = (id: number) => {
        if (!randomWeights.current.has(id)) {
            randomWeights.current.set(id, Math.random());
        }
        return randomWeights.current.get(id)!;
    };

    const sortedVideos = useMemo(() => {
        let sortedCopy = [...appContext.allVideos];

        switch (appContext.massTaggerSortOrder) {
            case VideosSortOrder.Title:
                sortedCopy.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case VideosSortOrder.Actor:
                sortedCopy.sort((a, b) => {
                    if (a.actors.length < 1 && b.actors.length > 0) return -1;
                    if (a.actors.length > 0 && b.actors.length < 1) return 1;
                    if (a.actors.length < 1 && b.actors.length < 1) return 0;
                    return a.actors[0].name.localeCompare(b.actors[0].name);
                });
                break;
            case VideosSortOrder.Source:
                sortedCopy.sort((a, b) => a.source.id - b.source.id);
                break;
            case VideosSortOrder.ID:
                sortedCopy.sort((a, b) => a.id - b.id);
                break;
            case VideosSortOrder.Random:
                // Sort based on the persistent random weight instead of a new Math.random()
                sortedCopy.sort((a, b) => getWeight(a.id) - getWeight(b.id));
                break;
            case VideosSortOrder.Favorite:
                // Apply the same logic for favorites to keep them stable
                sortedCopy.sort((a, b) => getWeight(a.id) - getWeight(b.id));
                const favorites = sortedCopy.filter(b => b.isFavorite);
                const other = sortedCopy.filter(b => !b.isFavorite);
                sortedCopy = favorites.concat(other);
                break;
            case VideosSortOrder.Date:
                sortedCopy.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
                break;
            default:
                console.log("getSortedVideos - Invalid Sort Order");
        }
        return sortedCopy;
    }, [appContext.allVideos, appContext.massTaggerSortOrder, shuffleVersion]);

    const handleScroll = () => {
        // Find the video card currently at the top of the viewport
        const items = document.querySelectorAll('.mass-tagger-item-wrapper');
        const headerHeight = 120; // Approx height of sticky filters
        
        for (const item of items) {
            const rect = item.getBoundingClientRect();
            if (rect.top >= headerHeight) {
                const id = item.getAttribute('data-video-id');
                if (id) appContext.setMassTaggerAnchorVideoId(parseInt(id));
                break;
            }
        }
    };

    useEffect(() => {
        // Restore scroll position using the Anchor ID
        if (appContext.massTaggerAnchorVideoId) {
            const element = document.getElementById(`video-${appContext.massTaggerAnchorVideoId}`);
            if (element) {
                element.scrollIntoView({ block: 'start' });
                // Account for sticky header offset
                window.scrollBy(0, -110);
            }
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sortedVideos]); // Re-run when list is rendered to handle lazy layout shifts

    const bodyClick = (video: Video) => {
        if (appContext.currentMassTaggerTag?.tagType === "video") {
            const updatedVideo = {
                ...video,
                tags: [...video.tags, appContext.currentMassTaggerTag]
            };
            appContext.updateVideo(updatedVideo);
        }
    }

    const secondaryClick = (video: Video) => {
        appContext.watchVideo(video)
    }

    const sortVideos = (order: VideosSortOrder) => {
        const isRandomType = order === VideosSortOrder.Random || order === VideosSortOrder.Favorite;
        if (isRandomType && appContext.massTaggerSortOrder === order) {
            // Force a re-sort because the button was clicked again
            reshuffle();
        } else {
            appContext.setMassTaggerSortOrder(order);
        }
    }

    const setTagToApply = (tagId: string) => {
        const tag = appContext.allVideoTags.find(t => t.id.toString() === tagId)
        if (tag) appContext.setMassTaggerTag(tag)
    }

    const containsTag = (video: Video): boolean => {
        return video.tags.some(t => t.id === appContext.currentMassTaggerTag?.id)
    }

    const alphaSort = (a: VideosAppTag, b: VideosAppTag): number => {
        return a.name.localeCompare(b.name)
    }

    return (
        <div className="videogallery-container dark-theme">
            <h3>Select a tag</h3>
            <div className="tag-select-container">
                <div className="tag-select-inner">

                    <select className="tag-select"
                        id="tag-select-dropdown"
                        onChange={(e) => setTagToApply(e.target.value)}
                        value={appContext.currentMassTaggerTag?.id ?? 0}>
                        {appContext.allVideoTags.toSorted(alphaSort).map((t, i) => (
                            <option value={t.id} key={i}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="videogallery-container-header">
                <VideoSortControls sortOrder={appContext.massTaggerSortOrder}
                    videoList={appContext.allVideos}
                    pageSize={appContext.allVideos.length}
                    sortVideos={sortVideos}
                    setPage={() => window.scrollTo(0, 0)} />
            </div>
            <div className="videogallery-container-inner"
                style={{ 'visibility': (appContext.showLoadingModal ? 'hidden' : 'visible') }}>
                {
                    sortedVideos.filter(v => !containsTag(v)).map((video, i) => (
                        <div 
                            key={video.id} 
                            id={`video-${video.id}`} 
                            className="mass-tagger-item-wrapper" 
                            data-video-id={video.id}
                        >
                            <VideoGalleryItem
                                index={i}
                                video={video}
                                bodyClickHandler={bodyClick}
                                lazyload={true}
                                secondaryClickHandler={secondaryClick}
                                secondaryClickIconUrl={EyeImage}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default MassTagger