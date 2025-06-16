import type IVideoSource from "../../../interfaces/videoSource";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";

interface SourceGalleryItemProps extends BaseGalleryItemProps<IVideoSource> {}

const SourceGalleryItem = (props: SourceGalleryItemProps) => {
    const bodyClick = (e: React.MouseEvent) => {
        if (props.bodyClickHandler)
            props.bodyClickHandler(props.data, props.index)
    }

    return (
        <div className="sourcegallery" key={props.data.id}>
            <div className="sourcegallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
                <img className="sourcegallery-image" src={props.imageUrl} alt={`${props.data.name} thumbnail`}></img>
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