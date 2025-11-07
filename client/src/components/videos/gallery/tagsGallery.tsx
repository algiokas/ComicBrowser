import { useContext, useState } from "react"
import { VideosAppContext } from "../videosAppContext"
import { TagType } from "../../../util/enums"
import type { VideosAppTag } from "../../../types/tags"
import TagsGalleryItem from "./tagsGalleryItem"

interface TagsGalleryProps { }

const TagsGallery = (props: TagsGalleryProps) => {
    const [tagType, setTagType] = useState<TagType>("Video")

    const appContext = useContext(VideosAppContext)

    const searchTag = (t: string): void => {
        appContext.viewSearchResults({
            tag: t
        })
    }

    const getTagsByType = (t: TagType): (VideosAppTag)[] => {
        switch (t) {
            case "Video":
                return appContext.allVideoTags.toSorted((a, b) => a.name.localeCompare(b.name))
            case "Actor":
                return appContext.allActorTags.toSorted((a, b) => a.name.localeCompare(b.name))
            default:
                return []
        }
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
                                return <div key={i} onClick={() => setTagType(t as TagType)} className={(tagType === t) ? 'selected' : ''}>
                                    {t}
                                </div>
                            })
                        }
                    </div>
                </div>

                <div className="tagsgallery-inner">
                    {
                        getTagsByType(tagType).map((tag: VideosAppTag, i: number) => {
                            return <TagsGalleryItem
                                index={i}
                                tag={tag}
                                bodyClickHandler={() => searchTag(tag.name)}>
                            </TagsGalleryItem>
                            // if (tagType === "Video" && tag.tagType === 'video') {
                            //     const tagVideo = getRandomVideoForTag(tag)
                            //     if (tagVideo) {
                            //         return <VideoGalleryItem
                            //             key={i}
                            //             index={i}
                            //             video={tagVideo}
                            //             imageUrl=''
                            //             bodyClickHandler={() => searchTag(tag.name)}>
                            //             <div className="caption-text">
                            //                 <span className="title">{tag.name}</span>
                            //             </div>
                            //         </VideoGalleryItem>
                            //     }
                            // }
                            // if (tagType === "Actor" && tag.tagType === 'actor') {
                            //     const tagActor = getRandomActorForTag(tag)
                            //     if (tagActor) {
                            //         return <ActorGalleryItem key={i}
                            //             index={i}
                            //             actor={tagActor}>
                            //             <div className="caption-text">
                            //                 <span className="title">{tag.name}</span>
                            //             </div>
                            //         </ActorGalleryItem>
                            //     }
                            // }

                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default TagsGallery