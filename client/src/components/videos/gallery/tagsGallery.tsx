import { useContext, useState } from "react"
import { VideosAppContext } from "../videosAppContext"
import { TagType } from "../../../util/enums"
import type { VideosAppTag, VideoTag } from "../../../types/tags"
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

    const nameSort = (a: VideosAppTag, b: VideosAppTag): number => {
        if (a.name === "Default Thumbnail") return -1
        return a.name.localeCompare(b.name)
    }
    const idSort = (a: VideosAppTag, b: VideosAppTag): number => b.id - a.id

    const getTagsByType = (t: TagType): (VideosAppTag)[] => {
        switch (t) {
            case "Video":
                return appContext.allVideoTags.toSorted(nameSort)//a.name.localeCompare(b.name))
            case "Actor":
                return appContext.allActorTags.toSorted(nameSort)
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
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default TagsGallery