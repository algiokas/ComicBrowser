import { useEffect, useRef, useState } from "react";
import type { VideoSource } from "../../../types/videoSource";
import { getSourceImageUrl, withThumbnailWidth } from "../../../api/urls";
import { useThumbnailWidth } from "../../../util/useThumbnailWidth";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";

type SourceGalleryItemProps = Omit<BaseGalleryItemProps<VideoSource>, 'imageUrl'> & {
    imageUrl?: string,
}

const SourceGalleryItem = (props: SourceGalleryItemProps) => {
    const [sourceImageUrl, setSourceImageUrl] = useState<string>(props.imageUrl ?? '')
    const imageContainerRef = useRef<HTMLDivElement>(null)
    const thumbnailWidth = useThumbnailWidth(imageContainerRef)
    const sizedImageUrl = withThumbnailWidth(sourceImageUrl, thumbnailWidth)

    useEffect(() => {
        const updateThumbnail = async () => {
            const thumbnailUrl = await getSourceImageUrl(props.data)
            setSourceImageUrl(thumbnailUrl)
        }
        if (!props.imageUrl) {
            updateThumbnail()
        }
    }, [props.data])

    const bodyClick = (_e: React.MouseEvent) => {
        if (props.bodyClickHandler)
            props.bodyClickHandler(props.data, props.index)
    }

    return (
        <div className="source-gallery" key={props.data.id}>
            <div className="source-gallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
                <div className="source-gallery-image" ref={imageContainerRef}>
                    <img src={sizedImageUrl} alt={`${props.data.name} thumbnail`}></img>
                </div>
                <div className="caption">
                    <div className="caption-text">
                        <span className="title">{props.data.name}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SourceGalleryItem
