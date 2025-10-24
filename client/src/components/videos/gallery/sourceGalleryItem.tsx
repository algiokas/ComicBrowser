import { useEffect, useState } from "react";
import type { VideoSource } from "../../../types/videoSource";
import { getSourceImageUrl } from "../../../util/helpers";

interface SourceGalleryItemProps {
    index: number,
    source: VideoSource,
    bodyClickHandler?: (data: VideoSource, index: number) => void,
    favoriteClickHandler?: (data: VideoSource) => void,
}

const SourceGalleryItem = (props: SourceGalleryItemProps) => {
    const [sourceImageUrl, setSourceImageUrl] = useState<string>('')

    useEffect(() => {
        const updateThumbnail = async () => {
            const thumbnailUrl = await getSourceImageUrl(props.source)
            setSourceImageUrl(thumbnailUrl)
        }
        updateThumbnail()
    }, [props.source])

    const bodyClick = (e: React.MouseEvent) => {
        if (props.bodyClickHandler)
            props.bodyClickHandler(props.source, props.index)
    }

    return (
        <div className="sourcegallery" key={props.source.id}>
            <div className="sourcegallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
                <img className="sourcegallery-image" src={sourceImageUrl} alt={`${props.source.name} thumbnail`}></img>
                <div className="caption">
                    <div className="caption-text">
                        <span className="title">{props.source.name}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SourceGalleryItem
