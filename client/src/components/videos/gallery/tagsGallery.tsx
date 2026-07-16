import { useContext, useState } from "react"
import { VideosAppContext } from "../../../context/videosAppContext"
import { TagType } from "../../../util/enums"
import type { VideosAppTag } from "../../../types/tags"
import TagsGalleryItem from "./tagsGalleryItem"

const TagsGallery = () => {
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
        <div className="tags-gallery-container dark-theme">
            <div className="tags-gallery-container-header">
                <div className="tags-gallery-type-select">
                    {
                        Object.keys(TagType).map((t, i) => {
                            return <div key={i} onClick={() => setTagType(t as TagType)} className={(tagType === t) ? 'selected' : ''}>
                                {t}
                            </div>
                        })
                    }
                </div>
            </div>

            <div className="tags-gallery-container-inner">
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
    )
}

export default TagsGallery