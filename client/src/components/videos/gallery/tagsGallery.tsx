import { useContext, useState } from "react"
import { VideosAppContext } from "../videosAppContext"
import type { IVideoTag } from "../../../interfaces/video"
import type { IActorTag } from "../../../interfaces/actor"
import { TagType } from "../../../util/enums"
import type IVideo from "../../../interfaces/video"
import VideoGalleryItem from "./videoGalleryItem"

interface TagsGalleryProps { }

const TagsGallery = (props: TagsGalleryProps) => {
    const [tagType, setTagType] = useState<TagType>("Video")

    const appContext = useContext(VideosAppContext)

    const searchTag = (t: string): void => {
        appContext.viewSearchResults({
            tag: t
        })
    }

    const getTagsByType = (t: TagType): (IVideoTag | IActorTag)[] => {
        switch (t) {
            case "Video":
                return appContext.allVideoTags
            case "Actor":
                return appContext.allActorTags
            default:
                return []
        }
    }

    const getRandomVideoForTag = (t: IVideoTag | IActorTag): IVideo | null => {
        const videosWithTag = appContext.allVideos.filter(v => {
            if (v.tags)
                return v.tags.some((a) => a.name.toLowerCase() === t.name.toLowerCase())
        })
        if (videosWithTag.length < 1) return null

        const randomIndex = Math.floor(Math.random() * videosWithTag.length)
        return videosWithTag[randomIndex]
    }

    return (
        <div className="tagsgallery dark-theme">
            <div className="tagsgallery-container">
                <div>
                    <h2 className="tagsgallery-header">
                        Tags
                    </h2>
                    <div className="tagsgallery-typeSelect">
                        {
                            Object.keys(TagType).map((t, i) => {
                                return <div key={i} onClick={() => setTagType(t as TagType)}>{t}</div>
                            })
                        }
                    </div>
                </div>

                <div className="tagsgallery-inner">
                    {
                        getTagsByType(tagType).map((tag: IVideoTag | IActorTag, i: number) => {
                            const tagVideo = getRandomVideoForTag(tag)
                            if (tagVideo) {
                                return <VideoGalleryItem 
                                    key={i}
                                    index={i} 
                                    video={tagVideo}
                                    bodyClickHandler={() => searchTag(tag.name)}>
                                        <div className="caption-text">
                                            <span className="title">{tag.name}</span>
                                        </div>
                                </VideoGalleryItem>
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default TagsGallery