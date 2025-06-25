import { useEffect, useState } from "react";
import type IVideoSource from "../../../interfaces/videoSource";
import { getSourceImageUrl } from "../../../util/helpers";

interface SourceGalleryItemProps {
    index: number,
    source: IVideoSource,
    bodyClickHandler?: (data: IVideoSource, index: number) => void,
    favoriteClickHandler?: (data: IVideoSource) => void,
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
