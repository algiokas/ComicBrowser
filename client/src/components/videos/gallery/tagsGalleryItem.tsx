import React, { useContext, useEffect, useState } from "react";
import { getActorImageUrl, getTagImageUrl, getVideoThumbnailUrl } from "../../../util/helpers";
import type { ActorTag, VideosAppTag, VideoTag } from "../../../types/tags";
import { VideosAppContext } from "../videosAppContext";
import type { Actor } from "../../../types/actor";
import type { Video } from "../../../types/video";
import CameraIcon from "../../../img/svg/camera.svg";

interface TagsGalleryItemProps {
    index: number,
    tag: VideosAppTag,
    bodyClickHandler?: (data: VideosAppTag, index: number) => void,
    onImageLoad?: (idx: number) => void,
}

const TagsGalleryItem = (props: TagsGalleryItemProps) => {
    const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string>('')

    const appContext = useContext(VideosAppContext)

    const getTagImage = async (): Promise<string> => {
        if (props.tag.imageFile) {
            const tagImage = await getTagImageUrl(props.tag)
            if (tagImage) return tagImage
        }

        if (props.tag.tagType === 'video') {
            const tagVideo = getRandomVideoForTag(props.tag)
            if (tagVideo) return getVideoThumbnailUrl(tagVideo)
        }

        if (props.tag.tagType === 'actor') {
            const tagActor = getRandomActorForTag(props.tag)
            if (tagActor) return getActorImageUrl(tagActor)
        }

        return ''
    }

    const getRandomVideoForTag = (t: VideoTag): Video | null => {
        const videosWithTag = appContext.allVideos.filter(v => {
            if (v.tags)
                return v.tags.some((a) => a.name.toLowerCase() === t.name.toLowerCase())
        })
        if (videosWithTag.length < 1) return null

        const randomIndex = Math.floor(Math.random() * videosWithTag.length)
        return videosWithTag[randomIndex]
    }

    const getRandomActorForTag = (t: ActorTag): Actor | null => {
        const actorsWithTag = appContext.allActors.filter(a => {
            if (a.tags)
                return a.tags.some(at => at.name.toLowerCase() === t.name.toLowerCase())
        })
        if (actorsWithTag.length < 1) return null
        const randomIndex = Math.floor(Math.random() * actorsWithTag.length)
        return actorsWithTag[randomIndex]
    }

    useEffect(() => {
        const updateThumbnail = async () => {
            const thumbnailUrl = await getTagImage()
            setThumbnailImageUrl(thumbnailUrl)
        }
        updateThumbnail()
    }, [props.tag])

    const bodyClick = (e: React.MouseEvent) => {
        if (props.bodyClickHandler)
            props.bodyClickHandler(props.tag, props.index)
    }

    return (
        <div className="videogallery" key={props.tag.name}>
            <div className="videogallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
                <div className="videogallery-image">
                    {
                        thumbnailImageUrl ?
                            <img
                                src={thumbnailImageUrl}
                                alt={`${props.tag.name} thumbnail`}
                                onLoad={() => { if (props.onImageLoad) props.onImageLoad(props.index) }}>
                            </img>
                            : null
                    }
                </div>
                <div className="caption">
                    <div className="caption-text">
                        <span className="title">{props.tag.name}</span>
                    </div>
                    <div className="image-icon">
                        <img className={props.tag.imageFile ? "svg-icon-disabled" : "svg-icon-red"} src={CameraIcon.toString()} alt={"Tag missing defined image"}></img>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TagsGalleryItem